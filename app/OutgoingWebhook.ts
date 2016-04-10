/// <reference path="../typings/meteor/meteor.d.ts" />
 /*
    https://rocket.chat/docs/master/server-management-1-integration-and-webhooks
 */


//import * as METEOR from "meteor";

/* exported Script */
/* globals console, _, s, HTTP */

/** Global Helpers
 * 
 * console - A normal console instance
 * _       - An underscore instance
 * s       - An underscore string instance
 * HTTP    - The Meteor HTTP object to do sync http calls
 */

class Script {
  /**
   * @params {object} request
   */
  prepare_outgoing_request({ request }) {
    // request.params            {object}
    // request.method            {string}
    // request.url               {string}
    // request.auth              {string}
    // request.headers           {object}
    // request.data.token        {string}
    // request.data.channel_id   {string}
    // request.data.channel_name {string}
    // request.data.timestamp    {date}
    // request.data.user_id      {string}
    // request.data.user_name    {string}
    // request.data.text         {string}
    // request.data.trigger_word {string}

    HTTP.call("POST", "http://localhost/bigbrother",
          {
              message: request.data.text
            }
         );
    
  }

  /**
   * @params {object} request, response
   */
  process_outgoing_response({ request, response }) {
    // request              {object} - the object returned by prepare_outgoing_request
    
    // response.error       {object}
    // response.status_code {integer}
    // response.content     {object}
    // response.content_raw {string/object}
    // response.headers     {object}

    // Return false will abort the response
    // return false;

    // Return empty will proceed with the default response process
     return;
  }
}