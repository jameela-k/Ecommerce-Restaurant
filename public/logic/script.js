/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// google variables
let map;
let marker;
let geocoder;
let responseDiv;
let response;

// i assume initializing map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    // how zoomed we are on the map
    zoom: 18,
    // starting location for the map (i've put it in manama bahrain)
    center: { lat: 26.22787000, lng: 50.58565000 },
    mapTypeControl: false,
  });
  geocoder = new google.maps.Geocoder();

// i assume adding marker
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(responseDiv);
  marker = new google.maps.Marker({
    map,
  });

  clear();

  // take address from page
  let stAddr = document.getElementById("streetAddr").innerText;
  let cityContry = document.getElementById("cityCountry").innerText;
  let plusCode = document.getElementById("plusCode").innerText;
  let restaurantName = document.getElementById("restaurantName").innerText;
  
  // if pluss code available
  if (plusCode) {

    // get geolocation from google using pluss code and place name 
    geocode({ address: restaurantName + ", " + plusCode });
  }
  // else if no plus code available
  else if (!plusCode) {

    // put it in variable
    let addr = restaurantName + ", " + stAddr + ", " + cityContry;
    
    // get geolocation from google using our address 
    geocode({ address: addr });
    }

}

// i assume remove marker
function clear() {
  marker.setMap(null);
}

// function to get a geolocation from address
function geocode(request) {
  clear();
  geocoder
    // get location from geolocation api and put it in results
    .geocode(request)
    .then((result) => {
      const { results } = result;
      map.setCenter(results[0].geometry.location);
      marker.setPosition(results[0].geometry.location);
      marker.setMap(map);


    // constant to get information from google place detail API
      const request = {
        placeId: results[0].place_id,
        fields: ["name", "formatted_address", "place_id", "geometry" , "reviews"],
      };
      // const infowindow = new google.maps.InfoWindow();
      const service = new google.maps.places.PlacesService(map);

      // google place detail api
      service.getDetails(request, (place, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place &&
          place.geometry &&
          place.geometry.location
        ) {
          // i assume put marker on location if found
          const marker = new google.maps.Marker({
            map,
            position: place.geometry.location,
          });
        }

        // creating a table to desplay the reviews from the detailed information we got from getDetail api
        const content = document.createElement("table");
        content.classList.add("table");
        content.classList.add("table-striped");
        // create table head
        const tableHead = document.createElement("thead");
        tableHead.innerHTML = '<tr><th scope="col">Photo</th><th scope="col">Author</th><th scope="col">Review</th><th scope="col">Rating</th></tr>'
        // add table head to table
        content.appendChild(tableHead);
        // create table body
        const tableBody = document.createElement("tbody");
        // for each review
        place.reviews.forEach(review => {
          //creat table row
          const tableRow = document.createElement("tr");
          
          //creat table field for photo
          const tableFieldPhoto = document.createElement("td");
          tableFieldPhoto.setAttribute("scope", "row");
          // creat img html element
          const ReviewerPhoto = document.createElement("img");
          ReviewerPhoto.setAttribute("alt", "user avatar");
          ReviewerPhoto.setAttribute("referrerpolicy", "no-referrer");
          // add google user's photo url to img src
          ReviewerPhoto.src = review.profile_photo_url;
          // add img to table field
          tableFieldPhoto.appendChild(ReviewerPhoto);
          // add table field to row
          tableRow.appendChild(tableFieldPhoto);

          //creat table field for name
          const tableFieldName = document.createElement("td");
          // creat p html element
          const ReviewerName = document.createElement("p");
          // add google user's name to p.innerText
          ReviewerName.innerText = review.author_name;
          // add p to table field
          tableFieldName.appendChild(ReviewerName);
          // add table field to row
          tableRow.appendChild(tableFieldName);

          //creat table field for review
          const tableFieldReview = document.createElement("td");
          // creat p html element
          const ReviewerReview = document.createElement("p");
          // add class overflow scroll
          ReviewerReview.classList.add("overflowScroll");
          // add google user's review to p.innerText
          ReviewerReview.innerText = review.text;
          // add p to table field
          tableFieldReview.appendChild(ReviewerReview);
          // add table field to row
          tableRow.appendChild(tableFieldReview);

          //creat table field for rating
          const tableFieldRating = document.createElement("td");
          // creat p html element
          const ReviewerRating = document.createElement("p");
          // add google user's rating to p.innerText
          ReviewerRating.innerText = review.rating;
          // add p to table field
          tableFieldRating.appendChild(ReviewerRating);
          // add table field to row
          tableRow.appendChild(tableFieldRating);

          // add table row to table body
          tableBody.appendChild(tableRow);
        });
        // add table body to table
        content.appendChild(tableBody);
        // put the table html inside the page div
        document.getElementById("testaddress").appendChild(content);
      });
      
      return results;
      
    })
    .catch((e) => {
      alert("Geocode was not successful for the following reason: " + e);
    });
}


// let addr = "House: 2836 Road no: 944 City: Hamad Town country: Bahrain" 
// geocode({ address: addr });

window.initMap = initMap;
// let addr = "House: 2836 Road no: 944 City: Hamad Town country: Bahrain" 
// geocode({ address: addr });



window.addEventListener("DOMContentLoaded", (event) => {
  //  console.log("DOM fully loaded and parsed");
   // grab all the h4 rating item element
   const ratingsBtns = document.getElementsByClassName("ratingsBtn");

  // add listner to all the for each item's h4 rating
   for (let i=0; i < ratingsBtns.length; i++) {
     
    //when clicked
    ratingsBtns[i].addEventListener("click",  function(e){
      const reviewsBoxes = document.getElementsByClassName("reviewsBox");
      // hide reviews by other users
      reviewsBoxes[i].classList.toggle('d-none');
    });
   }
 });