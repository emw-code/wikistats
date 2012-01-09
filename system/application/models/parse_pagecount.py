# parse_pagecount.py
#
# Copyright (c) 2012 Emw
# Dual licensed under MIT and GPL licenses
#
# This model retrieves and persists data from http://stats.grok.se, a widely-used web service for 
# getting daily page view data on Wikipedia articles (and individual files on other Wikimedia projects).  
# Once that data is in a local database, it can be retrieved much more quickly in the future than it could be by
# sending many HTTP requests for the same data to stats.grok.se.
#
# This model is called by wikistats_model.py

import os, re, MySQLdb, time, urllib2, urllib, sys, calendar
from datetime import datetime, timedelta

from optparse import OptionParser
import json

init_time = time.time()

json_time = []

optionParser = OptionParser()
optionParser.add_option("--page", dest="page")
optionParser.add_option("--month", dest="last_month")
optionParser.add_option("--project", dest="project")
optionParser.add_option("--mostRecentDate", dest="mostRecentDate")
(options, args) = optionParser.parse_args()

pages = []
pages.append(str(options.page))
	
months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
reference_months = months
years = []
currentYear = int(str(datetime.utcnow())[:4])
for year in range (2007, currentYear + 1):
	years.append(str(year))
project = 'en'
days = None

if (options.project != None):
	project = str(options.project)

# This option is somewhat extraneous since the addition of options.mostRecentDate.
# It might prove useful later, so it's kept around for now
if (options.last_month != None):
	months = [str(options.last_month)]
	currentYear = str(datetime.utcnow())[:4]
	years = [currentYear]	

# The mostRecentDate option indicates the most recent date for which a view count exists for a given article.
# It's passed into the script when old view counts are detected for an article, but  the most recent date doesn't match
# the current date.
if (options.mostRecentDate != None):
	(years, months, days) = getDatesToInsert(str(options.mostRecentDate))
	#print years
	#print months
	#print days


# HTTP-requests underlying page view data from stats.grok.se for the passed in year and month.
# Returns the 'daily_views' property of the JSON response from stats.grok.se.
# 'daily_views' is an array of the form [4633, 7498, 8855, 11274, 11080, 10058, 8769],
# where 4633 is the number of times the page was viewed on the 1st of the month, etc.
def get_page_views_json(project, page, year, month):
	
	http_init_time = time.time()
	proxy_handler = urllib2.ProxyHandler({})
	opener = urllib2.build_opener(proxy_handler)
	# Converts reserved characters to use their appropriate encodings
	# E.g., '5% foo' -> '5%25 foo' (% -> %25)
	#page = urllib.quote(page)
	
	# Example request: http://stats.grok.se/json/en/201201/DNA
	req = urllib2.Request('http://stats.grok.se/json/' + project + '/' + year + month + '/' + page)
	
	try:
		r = opener.open(req)
	except urllib2.URLError:
		print "URL error"
		time.sleep(10)
		r = opener.open(req)
	
	jsonData = json.loads(r.read())
	#print "Time to fetch JSON for " + page +", " + month + "/" + year + ": " + str(time.time() - http_init_time) + " seconds"
	json_time.append([time.time() - http_init_time])
	
	return jsonData["daily_views"]


# Formats data returned from get_page_views_json so that it can be inserted into the database.
# Returns viewCountsForMonth -- an array of rows to insert, where each row is of 
# the form ["en", "DNA", 11080, "2012-01-05"]
def extendViewCounts(project, page, year, month, firstDay, lastDay):
	
	#print 'in extendViewCounts'
	
	viewCountsForMonth = []
	
	views_by_day = get_page_views_json(project, page, year, month)
	
	# No data for before 12/2007 exists, so don't waste time querying for it
	if (year == '2007'):
		if (int(month) < 12): 
			return
		else:
			firstDay = 12
			lastDay = 31
	
	#print 'in extendViewCounts, views_by_day, december condition'
	
	if (year == '2008' and month == '07'):
		views_by_day.extend([0]*20)
	if (year == '2011' and month == '09'):
		views_by_day.extend([0]*1)

	#print 'in extendViewCounts, views_by_day.extend'

	if (firstDay != None and firstDay == lastDay):
		# Here, we're only updating data for one day
		day = firstDay
		view = views_by_day[int(day)]
		if (day < 10): day = "0" + day
		date = year + "-" + month + "-" + day
		viewCountsForMonth.append([project, page, str(view), date])
		return viewCountsForMonth
		
	if (firstDay == None and lastDay != None):
		# We get here in Case B outlined in insert_json_data
		 print "Case B"
	#print 'views_by_day = ' + str(views_by_day)
	i = 1
	for view in views_by_day:
		day = i
		i = i + 1
		#print 'day = ' + str(day)
		if ((firstDay != None and day < firstDay) or (lastDay != None and day > lastDay)): continue
		if (day < 10): day = "0" + str(day)
		date = year + "-" + month + "-" + str(day)
		viewCountsForMonth.append([project, page, str(view), date])
		
	return viewCountsForMonth

def insert_json_data(project, pages, years, months, days):
	i = 0
	page_init_time = time.time()
	page_total_time = 0
	viewCounts = []

	#print years
	#print months
	#print days

	for page in pages:
		i += 1
		j = 0
		for year in years:
			if (len(years) > 1):			
				# we only get here if we're either:
				#	 A) not updating; this is the initial insert, or
				#	B) haven't updated since last year
				for month in months:
					#print 'ok';
					viewCountsForMonth = extendViewCounts(project, page, year, month, None, None)
					if viewCountsForMonth != None:
						viewCounts.extend(viewCountsForMonth)
			else:
				# we only get into this 'else' condition if we're updating
				if (len(months) > 1):
					for month in months:
						# The most recent month with page view day is months[0], and the current month is months[1]
						firstDay = None
						lastDay = None
						if (month == months[0]): firstDay = days[0]
						if (month == months[1]): lastDay = days[0]
						viewCountsForMonth = extendViewCounts(project, page, year, month, firstDay, lastDay)
						viewCounts.extend(viewCountsForMonth)
				else:
					# we get here if we're updating for only one month.  this could be either because we're 
					# either updating view counts for :
					#	Case A) only yesterday, which breaks into two categories:
					#		1) yesterday is in this month
					#		2) yesterday is in last month (today is the first of the month)
					#	Case B) several days in this month (including yesterday).  Again two sub-cases:
					#		1) several days starting from beginning of this month
					#		2) several days starting from a few days into the month 
					#		(e.g. today's the 20th, and we're updating data from the 10th through the 19th)
					month = months[0]
					yesterday = (datetime.now() - timedelta(days=1)).strftime('%d')
					if (len(days) == 1):
						# This is Case A
						day = days[0]
						firstDay = day
						lastDay = day
					else:
						# This is Case B
						firstDay = days[0]
						lastDay = days[1]
					viewCountsForMonth = extendViewCounts(project, page, year, month, firstDay, lastDay)
					viewCounts.extend(viewCountsForMonth)
						
		j = j + 1
	
	#print viewCounts
	rowsToInsert = []
	for viewCount in viewCounts:
		row = []
		for element in viewCount:
			row.append("'" + element + "'")
		row = ", ".join(row)
		rowsToInsert.append("(" + row + ")")
	values = ", ".join(rowsToInsert)
	executeSQLQuery("INSERT INTO stats (Project, Page, Views, Date) VALUES " + values)


def executeSQLQuery(query):
	connection = MySQLdb.connect (
		host = "sql.toolserver.org",
		read_default_file = os.path.expanduser("~/.my.cnf"),
		db = "u_emw"
	)
	cursor = connection.cursor()
	cursor.execute(query)
	cursor.close()
	connection.commit()
	connection.close()

# Returns a list of days in a given month,
# e.g. ["01", "02", ..., "31"]
def getDaysInMonth(year, month):
	
	daysInMonth = []
	
	# Python's calendar module does not use zero-padding for months and days,
	# so remove the zero-padding if needed (e.g., convert "09" to "9")
	if (month[0] == "0"): month = month[1]
	month = int(month)
	year = int(year)
	for day in calendar.Calendar().itermonthdays(year, month):
		# Re-add zero padding as needed
		if (day != 0):
			if (day < 10): day = "0" + str(day)
			daysInMonth.append(day)
			
	return daysInMonth

# Returns arrays 'year', 'month' and 'day' indicating the first and last dates
# to retrieve and insert page view data for.
#
# parameter: mostRecentDate, a string.  For example, "2011-09-23".  
# 	Represents the most recent date for which a view count for the given project-page
# 
# This function is called if the --mostRecentDate option is passed into the script.
#
# Outline of some use cases:
# Let the current date be 2011-10-20 (October 20, 2011).
# Consider when the user queries for a page where the most recent
# date for which view counts exists in the database is:
# 	A) 	This year and month, but two days ago (e.g. 2011-10-18)
#		This function should return:
#			year = ['2011']
#			month = ['10']
#			days = ['19']
#	B) 	This year and month, but not several days ago (e.g. 2011-10-05)
#		Function should return:
#			year = ['2011']
#			month = ['10']
#			days = ['06', '19']
#	C) 	This year, but last month (e.g. 2011-09-23)
#		Function should return:
#			year = ['2011']
#			month = ['09', '10']
#			days = ['24', '19']
#	D)	This year, and only the day before the last day of last month (2011-09-29)
#		Function should return:
#			year =  ['2011']
#			month = ['09', '10']
#			days = ['30', '19']
#	E) 	Last year (e.g. 2010-12-25)
#		Function should return:
#			year = ['2010', '2011']
#			months = ['12', '10']
#			days = ['26', '19'] # iterate through each day in December 2011 *since* the 26th (inclusive), and every day in October 2011 *until* the 19th (inclusive)
# Now let the current date be 2011-10-01
#	F) 	This year, and only the last day of last month (2011-09-30)
#		Function should return:
#			year =  ['2011']
#			month = ['09']
#			days = ['30']
def getDatesToInsert(mostRecentDate):
	# most recent year-month-day
	mrYmd = mostRecentDate.split("-")
	mostRecentYear = mrYmd[0]
	mostRecentMonth = mrYmd[1]
	mostRecentDay = mrYmd[2]
	
	currentYmd = str(datetime.utcnow())[:10].split("-")
	currentYear = currentYmd[0]
	currentMonth = currentYmd[1]
	currentDay = currentYmd[2]
	
	daysToFetch = []
	monthsToFetch= []
	yearsToFetch = []
	
	daysInMostRecentMonth = getDaysInMonth(mostRecentYear, mostRecentMonth)
	daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth)
	
	
	if (mostRecentYear == currentYear):
		yearsToFetch = [currentYear]
		if (mostRecentMonth == currentMonth):
			monthsToFetch = [currentMonth]
			if (mostRecentDay == currentDay):
				# If this condition is true, then --mostRecentDate should not have been passed
				return
			else:
				daysToFetch = [int(mostRecentDay) + 1]
		else:
			monthsToFetch = [int(mostRecentMonth), int(currentMonth)]
			daysToFetch = [int(mostRecentDay) + 1, int(currentDay) - 1]
	else:
		i = 0
		year = int(currentYear)
		while ((year - i) >= int(mostRecentYear)):
			yearsToFetch.append(year - i)
			i = i + 1
		yearsToFetch.reverse()
		monthsToFetch = [int(mostRecentMonth), int(currentMonth)]
		daysToFetch = [int(mostRecentDay) + 1, int(currentDay) - 1]
	
	# Stringify years and days
	t_years = []
	t_months = []
	t_days = []
	for year in yearsToFetch: t_years.append(str(year))
	for month in monthsToFetch: 
		if (month < 10): month = "0" + str(month)
		t_months.append(str(month))
	for day in daysToFetch: 
		if (day < 10): day = "0" + str(day)
		t_days.append(str(day))
		
	yearsToFetch = t_years
	monthsToFetch = t_months
	daysToFetch = t_days
	
	return (yearsToFetch, monthsToFetch, daysToFetch)
	
# Checks that the given page(s) exist on the appropriate Wikimedia project,
# and inserts daily view data for those pages into a database.
def check_for_page(pages):
	pages_to_insert = []
	#print months
	for page in pages:
		#print page
		try:
			http_init_time = time.time()
			proxy_handler = urllib2.ProxyHandler({})
			opener = urllib2.build_opener(proxy_handler)
			# Converts reserved characters to use their appropriate encodings
			# E.g., '5% foo' -> '5%25 foo' (% -> %25)
			#page = urllib.quote(page)
			formatted_project = project
			if(len(project.split('.')) > 1):
				#print project.split('.')[0]
				formatted_project = project.split('.')[0]
				req = urllib2.Request('http://' + formatted_project + '.wikimedia.org/wiki/' + page, None, {"User-Agent":"Mozilla/5.0"})
			else:
				req = urllib2.Request('http://' + formatted_project + '.wikipedia.org/wiki/' + page, None, {"User-Agent":"Mozilla/5.0"})
			
			r = opener.open(req)
		except urllib2.HTTPError:
			sys.exit(1)
		pages_to_insert.append(page)
	
	#print pages_to_insert
	insert_json_data(project, pages_to_insert, years, months, days)
		
	
check_for_page(pages)


#print "\nTime for  data retrieval and insertions: " + str(time.time() - init_time) + " seconds"
