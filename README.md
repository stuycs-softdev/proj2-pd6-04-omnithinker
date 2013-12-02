OmniThinker
===========

*Project:* BUILD WEBSITE COMBINING IDEAS ON TOPIC SELECTED.

Our project features an interactive but clean writing and brainstorming tool
that allows users to insert a genre and then start typing. As the user starts
typing, suggestions pop up on a right hand toolbar of the window.

The genre chosen will have various points relating to it pop up on the toolbar,
which the user can click on to expand or contract (+ and -).

On expanding, the user decides whether the information is relevant to the topic
at hand. As the user writes and uses the suggestions from the toolbar, more
options pop up on the toolbar, offering more advice and possible points to hit
on in the course of writing. The information presented in the toolbar features
common sources from Google, Wikipedia and DuckDuckGo's API. By maintaining a
socket connection between the Python server and the JS client, we take input
from the user to create a list of relevant topics, and as the user crosses out
various topic boxes in the toolbar, more boxes pop up.

Depending on whether the user has a login or not, she can view the essays she
has written in the past or start with a blank template. With an SQlite database,
we store the data that the user, logged in or not, has written. To take input,
the user highlights certain words in the essay that they're writing and then our
software performs a search for those words, returning links, videos, article
titles, and snippets of information on the topic. The input is sent to the
SQlite which then sends the key words to a search function in the API mentioned.
They in turn, fetch data that is parsed in Python, which is then finally after
filtering, sent back and displayed via Javascript on the website. Once the user
has finished writing, he can then export what he has written into an external
PDF or text file stored in the SQlite database. The highlighted words won't show
up in the output file.

For instance: User selects the topic of stem cells for a science paper. Possible
topics that pop up on the sidebar are: Synthesis, Methodology, Research Patents,
Properties, Identification, Embryonic, Fetal and Adult stem cells. As the user
selects and uses the information in a topic, other ideas pop onto the toolbar
for the user's perusal.

Cool Feature: If time permits, we are thinking of connecting keystrokes to
musical notes, such that one can use OmniThinker with Jazzical, Piano, or other
instrumental notes accompanying the creative thinking.

*Role Division:*

+ Aaron Coppa: DuckDuckGo API
+ Edric Huang: FrontEnd Web Design
+ Ben Kurtovic: Wikipedia API
+ Jing Lin: Google API

Installing
----------

    pip install virtualenv
    virtualenv env
    source env/bin/activate
    pip install cython git+git://github.com/surfly/gevent.git@1.0rc3#egg=gevent flask Flask-Sockets gunicorn beautifulsoup4

Running
-------

    source env/bin/activate
    ./run.sh

Now go to [http://localhost:8000](http://localhost:8000).

Data
----

- http://en.wikipedia.org/w/api.php (Wiki)
- https://duckduckgo.com/api (DuckDuckGo)
- https://code.google.com/apis/console/?pli=1 (Google)
(MAYBE extra feature)
-https://www.programmableweb.com/api/easybib

Aaron and Jing
--------------

How it's going to work:

Aaron and Jing are responsible for the code that creates the sidebar. The
server, when it receives a signal that the user has modified keywords, calls a
function:

    result = apis.get_all_apis(keyword)

...which will return a list of the data in the sidebar. The data will look like:

    result = apis.get_all_apis(["apples", "health effects"])
    print result
    [
        {
            "title": "Wikipedia",
            "text": "An apple is a type of fruit...",
            "image": "http://en.wikipedia.org/w/apple.png"
        },
        {
            "title": "DuckDuckGo",
            "results": [
                {
                    "title": "Apples Linked to Curing Cancer",
                    "url": "http://nytimes.com/article/apples-cancer",
                    "text": "A recent study has linked apples to curing cancer..."
                }
            ]
        }
    ]

...ranked by importance.

So you guys need to come up with the algorithm that takes the keywords and
determines in what order to place results of APIs. The server will send this
list directly as JSON to the JS client, which will display it by rendering the
data to HTML, so JS will need to understand the possible keys in the
dictionaries returned by `get_all_apis()`.
