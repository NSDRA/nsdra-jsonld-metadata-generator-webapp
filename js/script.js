var lists = "";
var miList = "";
var miMapping = "";
var miMap = new Map();
var seed = "12345";

function updateChangeListeners(){

    var propCheck = document.querySelectorAll("input[id$='-name']");

    propCheck.forEach(function (element, index) {

        element.addEventListener('change', function() {

            currentCheckbox = this;

            if (this.checked) {

                if(jsonObj.hasOwnProperty("variableMeasured")){
                    jsonObj.variableMeasured.push({"@type": "schema:PropertyValue", "name": miMap.get(this.id)});
                }else{
                    jsonObj.variableMeasured = [];
                    jsonObj.variableMeasured.push({"@type": "schema:PropertyValue", "name": miMap.get(this.id)});
                }

            } else {

                jsonObj.variableMeasured.forEach(function (element, index) {
                    if(element.name === miMap.get(currentCheckbox.id)){
                        jsonObj.variableMeasured.splice(index,1);
                    }
                    if(jsonObj.variableMeasured.length == 0){
                        delete jsonObj.variableMeasured;
                    }
                });
            }

            jsonldTextArea.value = JSON.stringify(jsonObj,null, '\t');
        });
    });
}

function updateClickListeners(){

    var linksList = document.getElementsByClassName('list-group-item-action');

    for(var i = 0; i < linksList.length; i++) {

        linksList[i].onclick = function () {

            miList = lists.lists[this.dataset.index]["maturity indicators"];

            miMap = new Map();

            var switches = document.getElementById("switches");

            switches.innerHTML = "";

            jsonObj.variableMeasured = [];
            jsonldTextArea.value = JSON.stringify(jsonObj,null, "\t");

            for(i = 0 ; i < miList.length; i++){

                var hash = murmurhash3_32_gc(miList[i].variable,seed);
                switches.innerHTML = switches.innerHTML +
                `
                <div class="row pchem">
        			<div class="col-md-12">
        				<div class="custom-control custom-switch">
        					<input type="checkbox" class="custom-control-input" id="`+hash+`-name">
        					<label class="custom-control-label" for="`+hash+`-name">
                                <strong>`+miList[i].name+`</strong>
                                <a href="`+miList[i].url+`" target="_blank"><i class="fas fa-info-circle"></i></a>
                            </label>
                        </div>
        			</div>
        		</div>
                `;
               miMap.set(hash+'-name',miList[i].variable);
            }
			
            for(i = 0 ; i < miMapping.length; i++){
                var hash = murmurhash3_32_gc(miMapping[i].variable,seed);

                genericSwitches.innerHTML = genericSwitches.innerHTML +
                `
                <div class="row pchem">
        			<div class="col-md-12">
        				<div class="custom-control custom-switch">
        					<input type="checkbox" class="custom-control-input" id="`+hash+`-name">
        					<label class="custom-control-label" for="`+hash+`-name">
                                <strong>`+miMapping[i].name+`</strong>
                                <a href="`+miMapping[i].url+`" target="_blank"><i class="fas fa-info-circle"></i></a>
                            </label>
        				</div>
        			</div>
        		</div>
                `;
                miMap.set(hash+'-name',miMapping[i].variable);
            }
            updateChangeListeners();

            document.getElementById("mi-list-title").innerHTML = lists.lists[this.dataset.index].title;
            document.getElementById("choose-list").classList.add('hidden');
            document.getElementById("metadata-form").classList.remove('hidden');
        }
    }
}

async function fetchTextAsList() {

    let response = await fetch("lists.json");
    lists = await response.json();
    miList = lists.lists[0]["maturity indicators"];

    var switches = document.getElementById("switches");

    var listsDropdown = document.getElementById("mi-list-group");

    for(i = 0; i < lists.lists.length; i++){

        var opt = document.createElement('a');
        opt.href = "#";
        opt.title = lists.lists[i].title;
        opt.classList.add("list-group-item");
        opt.classList.add("list-group-item-action");
        opt.dataset.index = i;

        var optText = document.createTextNode('> ' + lists.lists[i].title);

        opt.appendChild(optText);

        listsDropdown.appendChild(opt);
    }

    for(i = 0 ; i < miList.length; i++){

        var hash = murmurhash3_32_gc(miList[i].variable,seed);
        switches.innerHTML = switches.innerHTML +
        `
        <div class="row pchem">
			<div class="col-md-12">
				<div class="custom-control custom-switch">
					<input type="checkbox" class="custom-control-input" id="`+hash+`-name">
					<label class="custom-control-label" for="`+hash+`-name">
                        <strong>`+miList[i].name+`</strong>
                        <a href="`+miList[i].url+`" target="_blank"><i class="fas fa-info-circle"></i></a>
                    </label>
				</div>
			</div>
		</div>
        `;
       miMap.set(hash+'-name',miList[i].variable);
    }
	
	let mappingResponse = await fetch("mapping.json");
    mapping = await mappingResponse.json();
    miMapping = mapping.lists[0]["maturity indicators"];
	
	updateChangeListeners();
    updateClickListeners();
}
fetchTextAsList();

var json = `
{
  "@context": {
    "bs": "https://bioschemas.org/",
	"schema": "https://schema.org/",
	"citation": "schema:citation",
	"name": "schema:name",
	"url": "schema:url",
	"variableMeasured": "schema:variableMeasured"
  },
  "@type": "schema:Dataset"
}
`;

var jsonldTextArea = document.getElementById("generated-jsonld");

var dsId = document.getElementById("ds-id");
var dsTitle = document.getElementById("ds-title");
var dsUrl = document.getElementById("ds-url");
var dsCitation = document.getElementById("ds-citation");

jsonldTextArea.value = json;

var jsonObj = JSON.parse(json);

var inputArr = [dsTitle, dsId, dsUrl, dsCitation];

var inputMap = new Map();

inputMap.set('ds-id','@id');
inputMap.set('ds-title', 'name');
inputMap.set('ds-url', 'url');
inputMap.set('ds-citation', 'citation');

inputArr.forEach(function (element, index) {

    element.addEventListener('keyup', function (event) {
        if (event.isComposing || event.keyCode === 229) {
            return;
        }

        let jsonProp = inputMap.get(element.id);

        if(element.value == ""){
            delete jsonObj[jsonProp];
        }else if(!jsonObj.hasOwnProperty(jsonProp)){
            jsonObj[jsonProp] = element.value;
        }else{
            jsonObj[jsonProp] = element.value;
        }

        jsonldTextArea.value = JSON.stringify(jsonObj,null, "\t");

    });
});

document.getElementById("resetForm").addEventListener('click', function (event) {
    jsonldTextArea.value = json;
    jsonObj = JSON.parse(json);
});

document.getElementById("changeList").addEventListener('click', function (event) {
    event.preventDefault();
    document.getElementById("choose-list").classList.remove('hidden');
    document.getElementById("metadata-form").classList.add('hidden');
});