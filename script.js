//use the window object to obtain the user's location
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  //store the latitude and longitude in local storage for the map
  localStorage.setItem("lat", JSON.stringify(position.coords.latitude));
  localStorage.setItem("lon", JSON.stringify(position.coords.longitude));
  // call the map function to generate the map based on the user's coordinates 
  GetMap();
}


var APIKey = "&rapidapi-key=092293fd7emshf39e0f6436d8314p1ad470jsnee116871f2d1";

// function for the map based off Bing Maps documentation 
function GetMap() {
  // retrieve user coordinates 
  var latFromStorage = JSON.parse(localStorage.getItem("lat"));
  var lonFromStorage = JSON.parse(localStorage.getItem("lon"));
  if (!latFromStorage || !lonFromStorage) {
    console.log("Please enable geolocation");
  } else {
    //create new location centerPoint 
        var centerPoint = new Microsoft.Maps.Location(
        latFromStorage,
        lonFromStorage
        );
        // create new map centered on the user's coordinates
        var map = new Microsoft.Maps.Map("#myMap", {
        center: centerPoint,
        });
        //create infobox for each pushpin. set it to not visible for now
        var infobox = new Microsoft.Maps.Infobox(centerPoint, {
            visible: false
        })
        //place the infobox onto the map
        infobox.setMap(map);
       // get user current location 
        var userLoc = new Microsoft.Maps.Location(latFromStorage, lonFromStorage);
        //create pushpin to show the user's location
        var pin = new Microsoft.Maps.Pushpin(userLoc, {
        title: "You",
        color: "red",
        visible: true,
        });
        // adding a new pin to new location 
        map.entities.push(pin);
        
        //set the map zoom and map type to road
        map.setView({
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        center: centerPoint,
        zoom: 11,
        });
        //URL for the local stores API call
        var storeURL =
        "https://dev.virtualearth.net/REST/v1/LocalSearch/?type=DepartmentStores&userLocation=" +
        latFromStorage +
        "," +
        lonFromStorage +
        ",10&key=AizLYVCVmDtzFe35OyVFF6FoMBjJuPA96Bc_pPQ50KQ9oMiNl4Pr89MbxB6FbzG9";
      // make a ajax call to Microsoft api 
        $.ajax({
            url: storeURL,
            method: "GET",
        }).then(function (response) {
            var array = response.resourceSets[0].resources;
            console.log(array);
            // arrey the items from the map and pin them to the map

            // console.log(array);
            //iterate through nearby stores and get the coordinates

            for (var i = 0; i < array.length; i++) {
                var loc = new Microsoft.Maps.Location(
                    array[i].point.coordinates[0],
                    array[i].point.coordinates[1]
                );
                //create a new pushpin for each local store 
                var pin = new Microsoft.Maps.Pushpin(loc, {
                //   icon: 45,
                visible: true,
                color: "blue",
                title: array[i].name //add title of store to the pushpin 
                });
                //metadata for each pusphin for the infobox
                pin.metadata = {
                    title: array[i].name,
                    description: array[i].Address.formattedAddress + "\n" + array[i].PhoneNumber
                };

                // when user hovers over the pin will show info about location 

                Microsoft.Maps.Events.addHandler(pin, "mouseover", pushpinHover);
                map.entities.push(pin);
            }
        });   
    }
    //function for the pushpin event handler that will display the infobox for each pushpin
    //with the name, address, and phone number
    function pushpinHover(e) {
        if (e.target.metadata) {
            infobox.setOptions({
                location: e.target.getLocation(),
                title: e.target.metadata.title,
                description: e.target.metadata.description,
                visible: true
            });
        }
    }
}
//event delegation for all initial buttons

$(".searchButton, .button").on("click", function () {
  var type = "";
  var tag = "";
  //if this is a product type button get text value
  if ($(this).hasClass("type-btn")) {
    var type = $(this).text();
  }
  //if this is a filter button get text value
  if ($(this).hasClass("filter-btn")) {
    var tag = $(this).text();
  }
  console.log(type);
  var queryURL = "https://makeup-api.herokuapp.com/api/v1/products.json?";
  //retrieve search bar value
  var makeup = $("#makeup-input").val();

// console.log("makeup: " + makeup);
// console.log("type: " + type);
//check if makeup has spaces
if (makeup.indexOf(" ") !== -1) {
  var temp = makeup.split(" ");
  makeup = "";
  //iterate through split string array and put a "+" after each index except the last
  for (var i = 0; i < temp.length; i++) {
    if (i == temp.length - 1) {
      makeup += temp[i];
    } else {
      makeup += temp[i] + "+";
    }
  }
}
//check if makeup is empty, if not add to the URL
  if (makeup !== "") {
    var temp = "brand=" + makeup;
    makeup = temp;
    queryURL += makeup;
  }
  //check if product type has spaces
  if (type.indexOf(" ") !== -1) {
    var temp = type.split(" ");
    type = "";
    //iterate through split string array and put a "+" after each index except the last
    for (var i = 0; i < temp.length; i++) {
      if (i == temp.length - 1) {
        type += temp[i];
      } else {
        type += temp[i] + "+";
      }
    }
  }
  //check if product type is empty (not selected), if not then add to URL
  if (type !== "") {
    var temp = "&product_type=" + type;
    type = temp;
    queryURL += type;
  }
  if (tag.indexOf(" ") !== -1) {
    var temp = tag.split(" ");
    tag = "";
    //iterate through split string array and put a "+" after each index except the last
    for (var i = 0; i < temp.length; i++) {
      if (i == temp.length - 1) {
        tag += temp[i];
      } else {
        tag += temp[i] + "+";
      }
    }
  }
  //check if product tag is empty (not selected), if not then add to URL
  if (tag !== "") {
    var temp = "&product_tags=" + tag;
    tag = temp;
    queryURL += tag;
  }


  //add APIkey to url
  queryURL += APIKey;
  // console.log(queryURL);
  getMakeupInfo(queryURL);
});


function showMakeupDetail(record) {
    // return anonymous function that is bound to the record
  return function(){
    var modalEl = $("#product-details");
      modalEl.html("");
      var dataIndex = $(this).attr("data-index");
      
  
  //    Return anonymous function tied to record detail

    var makeupFromStorage = JSON.parse(localStorage.getItem("makeupObject"));
    console.log(makeupFromStorage);
    console.log(record);
    var imgTag = $("<img>").attr({
        "src": record.image_link,
        "class": "modal-image"});
    var detailName = $("<h3>").text(record.name).attr("id", "detail-name");
    var brandCaps = record.brand.toUpperCase();
    var detailBrand = $("<p>").text(brandCaps).attr("id", "detail-brand");
    var detailTags = $("<p>").attr("id", "detail-tags").text("Tags: " + record.tag_list);
    var mapDiv = $("<div>").attr({
        "id": "myMap",
        "class": "modal-map",
    });
    modalEl.append(imgTag);
    modalEl.append(detailName);
    modalEl.append(detailBrand);
    modalEl.append(detailTags);
    modalEl.append(mapDiv);
    var latFromStorage = JSON.parse(localStorage.getItem("lat"));
    var lonFromStorage = JSON.parse(localStorage.getItem("lon"));
    // if the location it is not cached feth it on storage
    if (!latFromStorage || !lonFromStorage) {
      getLocation();
    } else {
      GetMap();
    }
  }
}


function getMakeupInfo(queryURL) {
  //code here for ajax call and dynamic element creation
  $("#results-col").empty();
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    localStorage.setItem("makeupObject", JSON.stringify(response));
    //can resize the for loop to however long we want
    for (var i = 0; i < 10; i++) {
        var newRow = $("<div>").attr("class", "grid-x");
        var newCol = $("<div>").attr("class", "results-line cell");
        
        // imageRow = $("<div>").addClass("grid-x");
        var imgTag = $("<img>").attr({
            "src": response[i].image_link,
            "class": "results-image"});
        // imageRow.append(imgTag);
        newCol.append(imgTag);

      //add data item to name or image?
      nameEl = $("<h3>").addClass("names").text(response[i].name);
      descriptionEl = $("<p>").addClass("description").text(response[i].description);
      newCol.append(nameEl);
      newCol.append(descriptionEl);
      newRow.append(newCol);
      //creating a button that we can select for the modal to pop up w/ product details
        var viewBtn=$("<button>").attr({
            class:"button filter-btn results-btn",
            id:"details-" + i,
            "data-open":"product-details",
            value:"view details"})
            .text("Product Details");
        newCol.append(viewBtn);

      // creating an on click for modal pop-up to be triggered for this detail item

      viewBtn.on("click", showMakeupDetail(response[i]));


      //appending to body, but can also append to a class or id
      $("#results-col").append(newRow);
    }
  });
}

