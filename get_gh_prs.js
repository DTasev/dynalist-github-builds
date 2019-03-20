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
  const YOUR_GITHUB_API_KEY = "";
  const container = document.getElementsByClassName("main-container")[0];
  const GITHUB_PR_API = "https://api.github.com/repos/mantidproject/mantid/pulls/";

  is_document_ready();

  /**
   * Starts the interval if Dynalist has finished loading, signified by the
   * main loader on the screen becoming invisible.
   */
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
  function get_all_prs() {
    for (const tag of document.getElementsByClassName("node-tag")) {
      // yikes, but what can you do, the structure is weird, and we want to avoid updating checked tags
      const parent_with_checked_status = tag.parentElement.parentElement.parentElement.parentElement;
      // if this tag is to get pull request status
      if (!parent_with_checked_status.className.includes("is-checked") && tag.textContent === "#prs") {
        for (const link of tag.parentElement.getElementsByClassName("node-link")) {
          // if this is a link to a pull request
          if (link.href.includes("/pull/")) {
            let last_backslash = link.href.lastIndexOf("/");
            // check if the URL ends in a / too, if so slice it off and try again
            if (last_backslash === link.length) {
              last_backslash = link.href.slice(0, link.href.length - 1).lastIndexOf("/");
              last_backslash = link.href.lastIndexOf("/");
            }
            // find the last / in the URL
            const pr_id = link.href.slice(last_backslash + 1);
            // make a PR data object to add more stuff to it, e.g. merged or not
            const pr_custom_data = { id: pr_id };
            // get the reviews, by calling into GET with the REVIEWS url
            get(GITHUB_PR_API + pr_id + "/reviews", tag, pr_custom_data, get_pr_reviews);
          }
        }

      }
    }
  }

  function get_pr_reviews(link_tag, pr_custom_data, review_data) {
    if (review_data.length > 0) {
      pr_custom_data.approved = review_data[0].state === "APPROVED";
      pr_custom_data.review_user = review_data[0].user.login;
    } else {
      pr_custom_data.approved = false;
      pr_custom_data.review_user = "";
    }
    // get the full PR data, by calling into GET with the single PR data URL
    get(GITHUB_PR_API + pr_custom_data.id, link_tag, pr_custom_data, get_pr_statuses);
  }

  function get_pr_statuses(link_tag, pr_custom_data, pr_data) {
    pr_custom_data.merged = pr_data.merged;
    // get the PR build status data, by calling into GET with the statuses details URL
    get(pr_data.statuses_url, link_tag, pr_custom_data, update_pr_tags);
  }


  function update_pr_tags(link_tag, pr_custom_data, status_data) {
    // tag status already exists, update it
    const elems = link_tag.parentElement.getElementsByClassName("fffff");
    if (elems.length > 0) {
      var a = elems[0];
      var status = elems[0];
    } else {
      var a = document.createElement("a");
      var status = document.createElement("a");
      var review = document.createElement("a");

      a.className = "node-link fffff";

      status.className = "node-link fffff";
      status.style.backgroundColor = "mediumpurple";
      status.style.color = "black";
      status.style.display = "none";

      review.style.display = "none";
      review.className = "node-link fffff";
      review.style.backgroundColor = "chartreuse";
      review.style.color = "black";

      link_tag.parentElement.appendChild(a);
      link_tag.parentElement.appendChild(review);
      link_tag.parentElement.appendChild(status);
      // link_tag.parentElement.insertBefore(status, link_tag.parentElement.children[0]);
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

    if (pr_custom_data.merged) {
      status.textContent = "Merged";
      status.style.display = "inline-block";
    }

    if (pr_custom_data.approved) {
      review.textContent = "✓ Approved by " + pr_custom_data.review_user;
      review.style.display = "inline-block";
    }
  }
  function get(url, link_tag, pr_custom_data, callback) {
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    const auth_basic = window.btoa("dtasev:" + YOUR_GITHUB_API_KEY);
    request.setRequestHeader("Authorization", "Basic " + auth_basic);

    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          callback(link_tag, pr_custom_data, JSON.parse(request.responseText));
        }
      }
    };
    request.send(null);
  }
  // Your code here...
})();