import { RtmClient, WebClient, CLIENT_EVENTS, RTM_EVENTS } from '@slack/client';
import parseMessage from './parseMessage';
import handleReactionAdded from './handleReactionAdded';

const addEvents = (rtm, web) => {
  let botUser;

  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (data) => {
    botUser = data.self.id;
  });

  rtm.on(RTM_EVENTS.MESSAGE, (message) => {
    parseMessage({web, message});
  });

  rtm.on(RTM_EVENTS.REACTION_ADDED, (message) => {
    if (message.item.type === 'message' && message.user === botUser) {
      console.log('reaction by myself');
    } else {
      handleReactionAdded({web, rtm, message});
    }
  });
};

const start = ({token}) => {
  const rtm = new RtmClient(token);
  const web = new WebClient(token);
  addEvents(rtm, web);
  rtm.start();
};

export { start };
