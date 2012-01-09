import os, datetime, MySQLdb

connection = MySQLdb.connect (host = "sql.toolserver.org",
	user = "emw",
	passwd = "chahhiwogheezeut",
	db = "u_emw")
cursor = connection.cursor ()

#cursor.execute("SELECT DISTINCT Page FROM stats")
cursor.execute("SELECT Page, Project FROM stats GROUP BY Page, Project");

rows = cursor.fetchall()

print 'test'
today_utc = str(datetime.datetime.utcnow())[:10]
beginning_of_this_month = today_utc[:8] + "01"

for row in rows:
	page = row[0]
	#print row
	cursor.execute("DELETE FROM stats WHERE Page='" + page +"' and Date >= '" + beginning_of_this_month + "'")
	
cursor.close()
connection.commit()
connection.close()

for row in rows:
	page = row[0]
	project = row[1]
	os.system("python parse_pagecount.py --page " + page + " --project " + project + " --month " + today_utc[5:7])

