FROM node:15.11.0-alpine3.13

ENV USER node

ENV HOME /home/$USER

ENV WORK $HOME/app

USER $USER

RUN mkdir $WORK

WORKDIR $WORK

COPY package.json ./

RUN yarn -s

COPY --chown=$USER:$USER . .

ENTRYPOINT ["sh", ".docker/entrypoint.sh"]

CMD ["yarn", "start:dev"]
