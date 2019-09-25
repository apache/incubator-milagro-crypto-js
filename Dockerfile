# Dockerfile
#
# @author  Kealan McCusker <kealanmccusker@gmail.com>
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# NOTES:
#
# To create the image execute:
#     docker build -t mcjs:builder .
#
# To run the tests:
#     docker run --rm mcjs:builder 
#
# To login to container:
#     docker run -it --rm mcjs:builder bash
# ------------------------------------------------------------------------------

FROM node:8

MAINTAINER kealanmccusker@gmail.com

WORKDIR /root

ADD . /root

RUN npm install

CMD npm test


