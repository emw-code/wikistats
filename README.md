[Wikistats](http://toolserver.org/~emw/wikistats/) - Wikipedia article traffic statistics
================================================================

Wikistats is a tool to visualize how viewership of Wikipedia articles has changed over time.

It uses [flot](http://code.google.com/p/flot/) to plot page view data for individual Wikipedia articles.  The underlying data is from 
the [stats.grok.se](http://stats.grok.se) tool created by Wikipedia user [Henrik](http://en.wikipedia.org/wiki/User:Henrik), and that 
data in turn is from [official, anonymized raw page view data](http://dumps.wikimedia.org/other/pagecounts-raw/) released for all 
Wikimedia projects.

This project augments the popular tool at stats.grok.se in a few ways:

1.  Page view data can be viewed over an arbitrarily long time span in daily increments.  With Wikistats, you can see how viewership 
    for an article has changed for over 4 years, rather than only 1, 2 or 3 months.  This longitudinal data reveals trends that do not 
    appear in shorter time spans.  If you only want a week of data, you can get that too.
2.  Data for up to three different pages can be plotted simultaneously.  You can plot three different pages in the same project (e.g. 
    "Influenza", "Allergy" and "Insomnia" on the English Wikipedia), or the same page on multiple different projects (e.g. "Influenza" on the English, 
    French and German Wikipedias).
3.  Summary statistics like the number of days plotted, total views, average number of views, and standard deviation are shown for all
    plots.  These statistics can be plotted for each graph by double-clicking on the plot's respective row in the legend.
4.  The cause of traffic spikes (e.g. http://toolserver.org/~emw/?project1=en&page1=Michael_Jackson) is inferred by analyzing metadata about the
    subject (e.g. from infoboxes) and searching for links to the subject on Wikipedia's main page on the dates around the traffic spike.  The inferred cause
    of any spikes is displayed in the plotted data.
5.  The raw data is available as A) a pre-formatted, sortable HTML table, B) a CSV file or C) over a JSON API.
