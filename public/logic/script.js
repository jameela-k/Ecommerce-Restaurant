/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
let map;
let marker;
let geocoder;
let responseDiv;
let response;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 18,
    center: { lat: 26.22787000, lng: 50.58565000 },
    mapTypeControl: false,
  });
  geocoder = new google.maps.Geocoder();

//   const inputText = document.createElement("input");

//   inputText.type = "text";
//   inputText.placeholder = "Enter a location";

//   const submitButton = document.createElement("input");

//   submitButton.type = "button";
//   submitButton.value = "Geocode";
//   submitButton.classList.add("button", "button-primary");

//   const clearButton = document.createElement("input");

//   clearButton.type = "button";
//   clearButton.value = "Clear";
//   clearButton.classList.add("button", "button-secondary");
//   response = document.createElement("pre");
//   response.id = "response";
//   response.innerText = "";
//   responseDiv = document.createElement("div");
//   responseDiv.id = "response-container";
//   responseDiv.appendChild(response);

//   const instructionsElement = document.createElement("p");

//   instructionsElement.id = "instructions";
//   instructionsElement.innerHTML =
//     "<strong>Instructions</strong>: Enter an address in the textbox to geocode or click on the map to reverse geocode.";
//   map.controls[google.maps.ControlPosition.TOP_LEFT].push(inputText);
//   map.controls[google.maps.ControlPosition.TOP_LEFT].push(submitButton);
//   map.controls[google.maps.ControlPosition.TOP_LEFT].push(clearButton);
//   map.controls[google.maps.ControlPosition.LEFT_TOP].push(
//     instructionsElement
//   );


  map.controls[google.maps.ControlPosition.LEFT_TOP].push(responseDiv);
  marker = new google.maps.Marker({
    map,
  });
//   map.addListener("click", (e) => {
//     geocode({ location: e.latLng });
//   });
//   submitButton.addEventListener("click", () =>
//     geocode({ address: inputText.value })
//   );
//   clearButton.addEventListener("click", () => {
//     clear();
//   });
  clear();
  let stAddr = document.getElementById("streetAddr").innerText;
  let cityContry = document.getElementById("cityCountry").innerText;
  let addr = stAddr + " " + cityContry;
  // let addr = "House: 2836 Road no: 944 City: Hamad Town country: Bahrain" 
  // document.getElementById("testaddress").innerText = addr;
  
  // "House: 2836 Road no: 944 City: Hamad Town country: Bahrain" 
  geocode({ address: addr });
  // document.getElementById("testaddress").innerText = gcoderesults;
}

function clear() {
  marker.setMap(null);
}

function geocode(request) {
  clear();
  geocoder
    .geocode(request)
    .then((result) => {
      const { results } = result;

      map.setCenter(results[0].geometry.location);
      marker.setPosition(results[0].geometry.location);
      marker.setMap(map);

      // document.getElementById("testaddress").innerText = JSON.stringify(results[0].place_id, null, 2);
    //   response.innerText = JSON.stringify(result, null, 2);

      const request = {
        placeId: results[0].place_id,
        fields: ["name", "formatted_address", "place_id", "geometry" , "reviews"],
      };
      const infowindow = new google.maps.InfoWindow();
      const service = new google.maps.places.PlacesService(map);

      service.getDetails(request, (place, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place &&
          place.geometry &&
          place.geometry.location
        ) {
          const marker = new google.maps.Marker({
            map,
            position: place.geometry.location,
          });

          // google.maps.event.addListener(marker, "click", () => {
          //   const content = document.createElement("div");
          //   const nameElement = document.createElement("h2");

          //   nameElement.textContent = place.name;
          //   content.appendChild(nameElement);

          //   const placeIdElement = document.createElement("p");

          //   placeIdElement.textContent = place.place_id;
          //   content.appendChild(placeIdElement);

          //   const placeAddressElement = document.createElement("p");

          //   placeAddressElement.textContent = place.formatted_address;
          //   content.appendChild(placeAddressElement);
          //   infowindow.setContent(content);
          //   infowindow.open(map, marker);
          // });
          // document.getElementById("testaddress").innerText = JSON.stringify(place.reviews, null, 2);
        }
        const content = document.createElement("table");
        const tableHead = document.createElement("thead");
        tableHead.innerHTML = "<tr><th>Photo</th><th>Author</th><th>Review</th><th>Rating</th></tr>"
        content.appendChild(tableHead);
        const tableBody = document.createElement("tbody");
        place.reviews.forEach(review => {
          
          const tableRow = document.createElement("tr");

          const tableFieldPhoto = document.createElement("td");
          const ReviewerPhoto = document.createElement("img");
          ReviewerPhoto.src = review.profile_photo_url;
          tableFieldPhoto.appendChild(ReviewerPhoto);
          tableRow.appendChild(tableFieldPhoto);

          const tableFieldName = document.createElement("td");
          const ReviewerName = document.createElement("p");
          ReviewerName.innerText = review.author_name;
          tableFieldName.appendChild(ReviewerName);
          tableRow.appendChild(tableFieldName);

          const tableFieldReview = document.createElement("td");
          const ReviewerReview = document.createElement("p");
          ReviewerReview.innerText = review.text;
          tableFieldReview.appendChild(ReviewerReview);
          tableRow.appendChild(tableFieldReview);

          const tableFieldRating = document.createElement("td");
          const ReviewerRating = document.createElement("p");
          ReviewerRating.innerText = review.rating;
          tableFieldRating.appendChild(ReviewerRating);
          tableRow.appendChild(tableFieldRating);

          tableBody.appendChild(tableRow);
        });
        content.appendChild(tableBody);
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