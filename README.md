This is intended to be used with TamperMonkey, and runs as a script on the dynalist.com/* website.

It will find nodes that contain `#prs` tag. Then it checks if the node contains a link to the PR in markdown format [...name...](...url...).

![example](https://image.prntscr.com/image/GzbsRbJQSea8kiK5-Y3f7w.png "Example")

The `#prs` tag tells the script to check for a link to a PR on the same line. The ID of the PR in the link is used to retrieve the information.
