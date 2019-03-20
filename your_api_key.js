// ==UserScript==
// @name         Dynalist Github API Key
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Store your Github API key in a document global variable to make changes easier to deploy. This script should be run on `document-start`
// @author       Dimitar Tasev
// @match        https://dynalist.io/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  // Make this run on document start. It will declare your API key as a variable on the document,
  // which the second script can read and use.
  // Is this safe? I have no idea. If you don't want to risk it, then don't use this approach
  document.YOUR_GITHUB_API_KEY = "";
})();