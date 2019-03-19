// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://dynalist.io/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  const container = document.getElementsByClassName("main-container")[0];
  const ce = document.createElement;
  is_document_ready();
  function is_document_ready() {
    var visibleLoader = null;
    for (const loader of container.getElementsByClassName("loader")) {
      if (loader.visible) {
        visibleLoader = loader;
      }
    }
    if (!visibleLoader) {
      get_all_prs();
      setInterval(get_all_prs, 30000);

    } else {
      console.log("Document not fully loaded. Waiting a bit more");
      setTimeout(is_document_ready, 1000);
    }
  }
  const GITHUB_PR_API = "https://api.github.com/repos/mantidproject/mantid/pulls/";
  function get_all_prs() {
    for (const tag of document.getElementsByClassName("node-tag")) {
      // if this tag is to get pull request status
      if (tag.textContent === "#prs") {
        for (const link of tag.parentElement.getElementsByClassName("node-link")) {
          // if this is a link to a pull request
          if (link.href.includes("/pull/")) {
            get(GITHUB_PR_API + link.textContent, tag, link.textContent, get_pr_statuses);
          }
        }

      }
    }
  }

  function get_pr_statuses(link_tag, pr_id, pr_data) {
    get(pr_data._links.statuses.href, link_tag, pr_id, update_pr_tags);
  }

  function update_pr_tags(link_tag, pr_id, status_data) {
    // tag status already exists, update it
    const elems = link_tag.parentElement.getElementsByClassName("fffff");
    if (elems.length > 0) {
      var a = elems[0];
    } else {
      var a = document.createElement("a");
      a.className = "node-link fffff";
      link_tag.parentElement.appendChild(a);
    }

    switch (status_data[0].state) {
      case "success":
        a.textContent = "✓";
        break;
      case "pending":
        a.textContent = "⌛";
        break;
      case "failure":
        a.textContent = "❌";
        break;
      default:
        break;
    }
    a.textContent += " " + status_data[0].context;

  }
  function get(url, link_tag, pr_id, callback) {
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    const auth_basic = window.btoa("dtasev:04d0858f8d8c23ed73700542a7c7c44ce1e4d678");
    request.setRequestHeader("Authorization", "Basic " + auth_basic);

    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          callback(link_tag, pr_id, JSON.parse(request.responseText));
        }
      }
    };
    request.send(null);
  }
  // Your code here...
})();