$(document).ready(function(){
	var app = new App();
});

App = function(){
	this.currentProgressWidth = 0;
	this.settings		= 	{
								portalServerUrl:"http://localhost:8080/portalserver",
								portalServerUserName:"admin",
								portalServerPassword:"admin"
							};
	this.holdforjon		= 	{};
	this.cookieVal 		=   "";
	this.zippedFile		= 	"";
	this.bound 			=   false;
	this.currentPage 	= 	0;
	this.preferences 	= 	[];
	this.enumerations 	= 	[];
	this.chrome 		= 	{};
	this.layout			=   false;
	this.widgetXML 		=   "";
	this.widgetHTML   	=   "";
	this.widgetCtrl 	=   "";
	this.widgetCSS 		=  	"";
	this.editor1		=   false;
	this.editor2		=   false;
	this.editor3		=   false;
	this.replacePathList= 	[];
	this.template 		= 	{
								identifier			: "",
								title 				: "",
								bodyLocation 		: "",
								headerLocation 		: "",
								devices 			: []
							}

	this.widget 		= 	{
								identifier			: "",
								name 				: "",
								author 				: "",
								description 		: "",
								bundle				: "",
								preferences 		: [],
								library 			: 	{
															externalCSS:false,
															externalJS:false
														}
							}


	this.pathManifest   = 	{
								"files":[],
								"media":[]
							};
	this.cmisManifest 	= 	{
								"folders":[],
								"media":[],
								"files":[],
								"modelXML":"",
								"bundleName":"com.backbase.2013",
								"widgetName":""
							};
	
	this.folderListMain = [];

	this.folders 		= {};
	this.folderList 	= 	[
								{
									name:"testA",
									folders:[
												{
													name:"testA1",
													folders:[]
												},
												{
													name:"testA2",
													folders:[]
												},
												{
													name:"testA3",
													folders:[]
												}
											]
								},
								{
									name:"testB",
									folders:[
												{
													name:"testB1",
													folders:[
																	{
																		name:"testB11",
																		folders:[
																					{
																						name:"testB111",
																						folders:[]
																					},
																					{
																						name:"testB112",
																						folders:[]
																					}
																				]
																	}
															]
												},
												{
													name:"testB2",
													folders:[]
												}
											]
								},
								{
									name:"testC",
									folders:[
												{
													name:"testBC1",
													folders:[
																{
																	name:"testC11",
																	folders:[]
																},
																{
																	name:"testC12",
																	folders:[]
																}
															]
												},
												{
													name:"testC2",
													folders:[
																{
																	name:"testC21",
																	folders:[]
																},
																{
																	name:"testC22",
																	folders:[]
																}
															]
												}
											]
								}
							];
	this.init();
};

App.prototype								= {};

App.prototype.init							= function(){

	var self = this;
	//Fade in the application
	$(".page_container").animate({
		opacity:1
	},400);

	$("#modal_error_badRegister").modal('hide');	
	$("#modal_progress_uploadWidget").modal('hide');
	$("#modal_error_badFileUpload").modal('hide');

	//Bind button handlers
	//Next Button
	if(self.bound == false){
		$(".btn-next").on("click",function(){

			if($(this).hasClass("btn-start")){
				$(this).transition({
					rotate:1800,
					opacity:0
				},1000,'cubic-bezier(0,0.9,0.3,1)');
				self.nextPage();
			}else if($(this).hasClass("btn-uploadWidget")){
				$(this).transition({
					rotate:1800,
					opacity:0
				},1000,'cubic-bezier(0,0.9,0.3,1)');

				self.nextPage(9);
			}else if($(this).hasClass("btn-uploadTemplate")){
				$(this).transition({
					rotate:1800,
					opacity:0
				},1000,'cubic-bezier(0,0.9,0.3,1)');

				self.nextPage(12);
			}else{
				self.nextPage();
			}
		});
		self.bound = true;
	}

	//Previous button
	$(".btn-prev").on("click",function(){
		self.prevPage();
	});

	//Bind firstForm elements
	$(".widgetProps").find("input").on("blur",function(){
		self.validateForm();
	});

	$(".templateProps").find("input").on("blur",function(){
		self.validateFormTemplate();
	});

	//Bind upload widget form elements
	$(".uploadProps").find("input").on("blur",function(){
		self.validateUploadForm();
	});

	$(".uploadTemplateProps").find("input").on("blur",function(){
		self.validateUploadTemplateForm();
	});

	$(".btn-windowTest").on("click",function(){

		self.widgetHTML = self.editor2.getValue();
		self.widgetCtrl = self.editor1.getValue();
		self.widgetCSS  = self.editor3.getValue();

		self.showLoadingMessage();

		self.buildZip(true);
		self.uploadZip(self.widget.identifier + ".zip","http://www.thenerdnomad.com/uploadingWidget.php");

	});

	$(".btn-done").on("click",function(){
		self.buildZip(false);
		self.nextPage();
	});	

	$(".btn-kill").on("click",function(){
		self.deleteTemps();
	});

	$(".btn-restart").on("click",function(){
		self.resetApp();
	});	

	$(".btn-test").on("click",function(){
		//self.cmis_createWidget();
		//self.cmis_addWidget();
		self.cmis_login();
	});

	//File Upload handler.
	$("#widgetZip").on("click",function(){
		$("#file").trigger("click");
	});

	$("#file").on("change",function(){
		$("#widgetZip").removeClass("glyphicon-cloud-upload");
    	$("#widgetZip").addClass("glyphicon-floppy-disk");
	});

	$("#templateZip").on("click",function(){
		$("#templateFile").trigger("click");
	});

	$("#templateFile").on("change",function(){
		$("#templateZip").removeClass("glyphicon-cloud-upload");
    	$("#templateZip").addClass("glyphicon-floppy-disk");
	});

	$(".btn-uploadTemplate").on("click", function(evt) {
      //var files = evt.target.files;
      var files = $("#templateFile")[0].files;
      for (var i = 0, f; f = files[i]; i++) {

        if (f.type !== "application/zip") {
          //$result.append("<div class='warning'>" + f.name + " isn't a 'application/zip', opening it as a zip file may not work :-)</div>");
			$("#modal_error_badFileUpload").modal('show');
			$("#templateZip").addClass("glyphicon-cloud-upload");
    		$("#templateZip").removeClass("glyphicon-floppy-disk");
			return false;
        }

        self.template.title 		 = $("#template_name").val();
        self.template.identifier 	 = $("#template_name").val().replace(/ /g,"_") + "_" + Math.floor(Math.random()*99999);

        var devices = $(".template_device").val()

        $(devices).each(function(index,item){
        	self.template.devices.push({name:item});
        });
        
        self.cmisManifest.bundleName = $("#template_bundle").val();
		self.cmisManifest.widgetName = $("#template_name").val().replace(/ /g,"_");

        //Start the progress modal
        $("#modal_progress_uploadWidget").modal('show');

        self.progress_updateProgress(5,"Reading .zip file...");

        var reader = new FileReader();
        	
        function addFolders(aEntry,dirs){
        	if(dirs.length == 0){return false;}
        	var entry = dirs.shift();
        	if(entry != ""){
        		var found 	= false;
        		var x 		= 0;
        		for(;x<aEntry.length;x++){
        			if(aEntry[x].name == entry){
        				found = true;
        				break;
        			}
        		}
        		if(found == false){
        			var item = {
        				name:entry,
        				folders:[]
        			}
        			aEntry.push(item);
        		}
    			addFolders(aEntry[x].folders,dirs);
        	}else{
        		addFolders(aEntry,dirs);
        	}
        }


        // Closure to capture the file information.
        reader.onload = (function(theFile) {
          return function(e) {
            //try {
              // read the content of the file with JSZip
              var zip = new JSZip(e.target.result);
              self.progress_updateProgress(1,"Creating file manifest...");

              // that, or a good ol' for(var entryName in zip.files)
              $.each(zip.files, function (index, zipEntry) {
              	
              	//Find out if the file is a folder.
              	if(zipEntry.name.search("__MACOSX") != -1 || zipEntry.name.search("DS_Store") != -1){return true;}//skip OSX auto files.
              	var isDir = (zipEntry.name.lastIndexOf("/") == (zipEntry.name.length -1))?true:false;
              	switch(isDir){
              		case true:
              			var sDir = zipEntry.name.split("/");
              			addFolders(self.cmisManifest.folders,sDir);
              			break;
              		case false:
              			//Check the file extension to see what kind of file it is.
              			var aName  	= zipEntry.name.split("."); 
              			var sExt 	= aName[aName.length -1];
              			var sName 	= zipEntry.name.split("/")[zipEntry.name.split("/").length - 1];

              			if(sExt == "xml" || sExt == "html" || sExt == "js" || sExt == "css"){
              				self.pathManifest.files.push(zipEntry.name);
              				if(sName == "widget.xml"){
              					self.cmisManifest.modelXML 		= zipEntry.asText();
              					self.cmisManifest.files[sName] 	= zipEntry.asBinary();
              				}else{
              					self.cmisManifest.files[sName] = zipEntry.asBinary();
              				}
              			}else{
              				//console.log("Adding this file as binary: " + sName);
              				self.pathManifest.media.push(zipEntry.name);
              				self.cmisManifest.media[sName] = zipEntry.asArrayBuffer();
              			}
              			break;
              	}
              });
              // end of the magic !

            //} catch(e) {
            ///	console.log("Error reading the file: " + theFile.name);
            //}
            var test = [
			            	{
			            		name:self.cmisManifest.bundleName,
			            		folders:[
			            			{
			            				name:"templates",
			            				folders:[
			            					{
			            						name:self.cmisManifest.widgetName,
			            						folders:self.cmisManifest.folders
			            					}
			            				]
			            			}
			            		]
			            	}
			            ];
			self.cmisManifest.folders = test;
            self.cmis_CreateTemplate();
          }
        })(f);

        // read the file !
        // readAsArrayBuffer and readAsBinaryString both produce valid content for JSZip.
        //reader.readAsArrayBuffer(f);
        reader.readAsBinaryString(f);
      }
    });

	$(".btn-upload").on("click", function(evt) {
      //var files = evt.target.files;
      var files = $("#file")[0].files;
      for (var i = 0, f; f = files[i]; i++) {

        if (f.type !== "application/zip") {
          //$result.append("<div class='warning'>" + f.name + " isn't a 'application/zip', opening it as a zip file may not work :-)</div>");
			$("#modal_error_badFileUpload").modal('show');
			$("#widgetZip").addClass("glyphicon-cloud-upload");
    		$("#widgetZip").removeClass("glyphicon-floppy-disk");
			return false;
        }

        //Start the progress modal
        $("#modal_progress_uploadWidget").modal('show');

        self.progress_updateProgress(5,"Reading .zip file...");

        var reader = new FileReader();
        	
        function addFolders(aEntry,dirs){
        	if(dirs.length == 0){return false;}
        	var entry = dirs.shift();
        	if(entry != ""){
        		var found 	= false;
        		var x 		= 0;
        		for(;x<aEntry.length;x++){
        			if(aEntry[x].name == entry){
        				found = true;
        				break;
        			}
        		}
        		if(found == false){
        			var item = {
        				name:entry,
        				folders:[]
        			}
        			aEntry.push(item);
        		}
    			addFolders(aEntry[x].folders,dirs);
        	}else{
        		addFolders(aEntry,dirs);
        	}
        }


        // Closure to capture the file information.
        reader.onload = (function(theFile) {
          return function(e) {
            //try {
              // read the content of the file with JSZip
              var zip = new JSZip(e.target.result);
              self.progress_updateProgress(1,"Creating file manifest...");

              // that, or a good ol' for(var entryName in zip.files)
              $.each(zip.files, function (index, zipEntry) {
              	
              	//Find out if the file is a folder.
              	if(zipEntry.name.search("__MACOSX") != -1 || zipEntry.name.search("DS_Store") != -1){return true;}//skip OSX auto files.
              	var isDir = (zipEntry.name.lastIndexOf("/") == (zipEntry.name.length -1))?true:false;
              	switch(isDir){
              		case true:
              			var sDir = zipEntry.name.split("/");
              			addFolders(self.cmisManifest.folders,sDir);
              			break;
              		case false:
              			//Check the file extension to see what kind of file it is.
              			var aName  	= zipEntry.name.split("."); 
              			var sExt 	= aName[aName.length -1];
              			var sName 	= zipEntry.name.split("/")[zipEntry.name.split("/").length - 1];

              			if(sExt == "xml" || sExt == "html" || sExt == "js" || sExt == "css"){
              				self.pathManifest.files.push(zipEntry.name);
              				if(sName == "manifest.js"){
              					self.pathManifest.files.pop();
              					var oManifest = $.parseJSON(zipEntry.asText());

              					self.cmisManifest.bundleName = oManifest.bundleName;
              					self.cmisManifest.widgetName = oManifest.widgetName;
              				}
              				if(sName == "widget.xml"){
              					self.cmisManifest.modelXML 		= zipEntry.asText();
              					self.cmisManifest.files[sName] 	= zipEntry.asBinary();
              				}else{
              					self.cmisManifest.files[sName] = zipEntry.asBinary();
              				}
              			}else{
              				//console.log("Adding this file as binary: " + sName);
              				self.pathManifest.media.push(zipEntry.name);
              				self.cmisManifest.media[sName] = zipEntry.asArrayBuffer();
              			}
              			break;
              	}
              });
              // end of the magic !

            //} catch(e) {
            ///	console.log("Error reading the file: " + theFile.name);
            //}
            var test = [
			            	{
			            		name:self.cmisManifest.bundleName,
			            		folders:[
			            			{
			            				name:"widgets",
			            				folders:[
			            					{
			            						name:self.cmisManifest.widgetName,
			            						folders:self.cmisManifest.folders
			            					}
			            				]
			            			}
			            		]
			            	}
			            ];
			self.cmisManifest.folders = test;
            self.cmis_CreateWidget();
          }
        })(f);

        // read the file !
        // readAsArrayBuffer and readAsBinaryString both produce valid content for JSZip.
        //reader.readAsArrayBuffer(f);
        reader.readAsBinaryString(f);
      }
    });

	//Preference Pane
	$(".preference_type").on("change",function(){
		self.changeType(this);
	});

	$(".preference_add").on("click",function(){
		self.addPreference(this);
	});

	$(".preference_delete").on("click",function(){
		self.removePreference($(this).parents("form"));
	});

	$(".preference_details").on("click",function(){
		self.showPrefEditModal(sVal);
	});
};

App.prototype.showLoadingMessage			= function(){

	$("#modal_loading_widget").modal("show");

};

App.prototype.hideLoadingMessage			= function(){

	$("#modal_loading_widget").modal("hide");

}

App.prototype.progress_updateProgress		= function(iProgress,sMsg){
	var self 					= this;
	var oTarget 				= $(".progress-bar");
	var cWidth 					= self.currentProgressWidth;

	var iTot					= cWidth + iProgress;
	var iDiff					= (iTot < 100)?iTot:100;

	$(".progress-bar").attr("aria-valuenow",iDiff);
	$(".progress-bar").width(iDiff + "%");
	$(".upload_progress").html(sMsg);
	self.currentProgressWidth = iDiff;
}

App.prototype.cmis_addWidget				= function(oFile){

	var self 		= 	this;

	self.cmis_createFolder("")
};

App.prototype.renderEditor					= function(){
	var self = this;
	
	//Add the content to the page
	$("#widget_js").html(self.widgetCtrl);
	$("#widget_html").text(self.widgetHTML);

	//-----------------------------------------------------------------------------------------------
	
		self.layout = $('#container').layout();
		self.layout.sizePane("east", 430);

		//Add Ace stuffs here
		self.editor1 = ace.edit("widget_js");
	    self.editor1.setTheme("ace/theme/eclipse");
	    self.editor1.getSession().setMode("ace/mode/javascript");

	    self.editor2 = ace.edit("widget_html");
	    self.editor2.setTheme("ace/theme/eclipse");
	    self.editor2.getSession().setMode("ace/mode/html");

	    self.editor3 = ace.edit("widget_css");
	    self.editor3.setTheme("ace/theme/eclipse");
	    self.editor3.getSession().setMode("ace/mode/css");

	//__----------------------------------------------------------------------------
};

App.prototype.cmis_checkFolder				= function(sRootID,sFolderName,fnCallback){
	var self = this;
	self.oDataRes = "";

	//Now that I have the root ID, lets check for a bundle name.
	var sUrl2 = 	self.settings.portalServerUrl + "/content/atom/contentRepository/query";
	var oData = 	{
						includeAllowableActions:"false",
						includeRelationships:"none",
						maxItems:"30",
						q:"SELECT * FROM cmis:folder WHERE  cmis:parentId = '" + sRootID + "' AND cmis:name= '" + sFolderName + "' ORDER BY cmis:name ASC",
						searchAllVersions:"false",
						skipCount:"0"
					};
	$.ajax({
		url:sUrl2,
		type:"GET",
		data:oData
	}).done(function(data){
		var ooData = $.xml2json(data);
		if(ooData["entry"] == undefined){//folder does not exist.
			fnCallback(false);
		}else{
			$(ooData["entry"]["object"]["properties"]["propertyId"]).each(function(index,item){
	            if(item["propertyDefinitionId"] == "cmis:objectId"){
	                sObjectID = item["value"];
	                return false;
	            }
	        });
			fnCallback(sObjectID);	
		}
	});
};

App.prototype.cmis_getFileType				= function(sName){

	var oTypes 			= 	{
								"jpg":"image/jpeg",
								"jpeg":"image/jpeg",
								"png":"image/png",
								"gif":"image/gif",
								"js":"text/html",
								"json":"text/html",
								"xml":"text/xml",
								"html":"text/html",
								"xhtml":"text/html",
								"css":"text/css"
							};

	var Type 			= sName.split(".");
	var sContentType 	= oTypes[Type[Type.length -1]];

	return (sContentType != undefined)?sContentType:"text/html";

};

App.prototype.cmis_getCMISFileType			= function(sName){

	var oTypes 			= 	{
								"jpg":"bb:image",
								"jpeg":"bb:image",
								"png":"bb:image",
								"gif":"bb:image",
								"js":"cmis:document",
								"json":"cmis:document",
								"xml":"cmis:document",
								"html":"cmis:document",
								"xhtml":"cmis:document",
								"css":"cmis:document"
							};

	var Type 			= sName.split(".");
	var sContentType 	= oTypes[Type[Type.length -1]];

	return (sContentType != undefined)?sContentType:"cmis:document";

};

App.prototype.cmis_buildPOST				= function(item,isTemplate){
	var self 			= 	this;
	var sName 			=   item.name;
	var xPath 			= 	item.path.lastIndexOf("/");
	var itemPath 		=   (xPath != -1)?"/" + item.path.slice(0,item.path.lastIndexOf("/")):"";
	var sItemFolder		= 	(isTemplate == undefined)?"widgets":"templates";
	var sPath 			=   "/" + item.bundleName + "/" + sItemFolder + "/" + item.widgetName + itemPath;
	var sType 			= 	self.cmis_getCMISFileType(item.name);
	var sContentType 	= 	self.cmis_getFileType(item.name);

	var oData 			= new FormData();
	
	oData.append("name",sName);
	oData.append("targetPath",sPath);
	oData.append("cmis:createdBy","admin");
	oData.append("cmis:lastModifiedBy","admin");
	oData.append("cmis:objectTypeId",sType);
	oData.append("bb:title",sName);
	
	//Create the file to be uploaded.
	var blob = new Blob([item.fileContent], {
			type: self.cmis_getFileType(sName)
		});

	oData.append("file",blob,sName);

	return oData;
};

App.prototype.cmis_updateContent			= function(sContent,sSourcePath){

	var self		= this;
	var sPathStart 	= (sSourcePath.lastIndexOf("/") != -1)?sSourcePath.slice(0,sSourcePath.lastIndexOf("/") + 1):"";

	//Run through the file and do a regExp on the pathnames.
	for(var x=0;x<self.replacePathList.length;x++){
		var sOldPath 	= self.replacePathList[x].oldPath.replace(sPathStart,"");
		var sName 		= self.replacePathList[x].oldPath.split("/");
		var test1 		= "(" + sOldPath + "|/" + sOldPath + "|../" + sOldPath +  "|../../" + sOldPath+ "|../../../" + sOldPath + ")";
		var test 		= new RegExp(test1,"g");
		var sNewPath 	= self.settings.portalServerUrl + "/content/atom/contentRepository/content/" + sName[sName.length -1] + "?id=" + self.replacePathList[x].newPath;

		sContent 		= sContent.replace(test,sNewPath);
	}
	return sContent;
};

App.prototype.extractHead					= function(sContent){
	var self = this;

	var sOut 	= sContent.slice(sContent.indexOf("<head>") + 6,sContent.lastIndexOf("</head>") -1);
	return sOut;
};

App.prototype.extractBody					= function(sContent){
	var self = this;
	var sOut 	= sContent.slice(sContent.indexOf("<body") -1,sContent.lastIndexOf("</body>") -1);
	return sOut;	
};

App.prototype.cmis_getPath					= function(sPath,sFilePath,fnCallback){
	var self 		= this;
	var sUrl 		= self.settings.portalServerUrl + "/content/atom/contentRepository/path/?path=" + sPath + "&includeAllowableActions=false";

	$.ajax({
		url:sUrl,
		type:"GET",
		contentType:"text/xml"
	}).done(function(data){
		var ooData = $.xml2json(data);
		$(ooData["object"]["properties"]["propertyId"]).each(function(index,item){
            if(item["propertyDefinitionId"] == "cmis:objectId"){
                self.replacePathList.push({
                	oldPath:sFilePath,
                	newPath:item["value"]
                });
                return false;
            }
        });

		fnCallback();
	});		

};

App.prototype.cmis_login				= function(fnCallback){

	var self 	= 	this;

	self.progress_updateProgress(2,"Logging into content services...");

	self.storeUploadSettings();

	//Start by Logging into the portal
	var sUrl 	= 	self.settings.portalServerUrl + "/j_spring_security_check";
	var oData 	= 	{
						j_password:self.settings.portalServerPassword,
						j_username:self.settings.portalServerUserName
					};
	$.ajax({
		url:sUrl,
		type:"POST",
		data:oData
	}).done(function(data,status,oReq){
		//if(oReq.getResponseHeader("Cache-Control") == null){
		if(parseFloat(oReq.getResponseHeader("Content-Length")) < 4312){
			$("#modal_progress_uploadWidget").modal("hide");
			$("#modal_error_badLogin").modal("show");
			return false;
		}else{
			fnCallback();
		}
	}).fail(function(){
		$("#modal_progress_uploadWidget").modal("hide");
		$("#modal_error_badLogin").modal("show");
		return false;
	});
};

App.prototype.cmis_CreateWidget				= function(){
	var self 	= this;
	var sUrl 	= self.settings.portalServerUrl + "/content/atom/contentRepository/path/?path=/&filter=cmis:objectId,cmis:name&includeAllowableActions=false";
	
	var aFolders= self.cmisManifest.folders;

	var fnCallback = function(){
		//debugger;
		self.cmis_uploadFiles();
	}

	//First, get the ID of the parent node.
	$.ajax({
		url:sUrl,
		success:function(data){
			//debugger;
		}
	}).done(function(data){
		var oData 	= $.xml2json(data);
		var sRootID = "";
		$(oData["object"]["properties"]["propertyId"]).each(function(index,item){
            if(item["propertyDefinitionId"] == "cmis:objectId"){
                sRootID = item["value"];
                return false;
            }
        });
		self.cmis_createFolderArray(sRootID,aFolders,fnCallback);
	});
};

App.prototype.cmis_CreateTemplate				= function(){
	var self 	= this;
	var sUrl 	= self.settings.portalServerUrl + "/content/atom/contentRepository/path/?path=/&filter=cmis:objectId,cmis:name&includeAllowableActions=false";
	
	var aFolders= self.cmisManifest.folders;

	var fnCallback = function(){
		//debugger;
		self.cmis_uploadTemplateFiles();
	}

	//First, get the ID of the parent node.
	$.ajax({
		url:sUrl,
		success:function(data){
			//debugger;
		}
	}).done(function(data){
		var oData 	= $.xml2json(data);
		var sRootID = "";
		$(oData["object"]["properties"]["propertyId"]).each(function(index,item){
            if(item["propertyDefinitionId"] == "cmis:objectId"){
                sRootID = item["value"];
                return false;
            }
        });
		self.cmis_createFolderArray(sRootID,aFolders,fnCallback);
	});
};

App.prototype.cmis_createFolderArray 		= function(sRootID,aFolders,fnCallback){
	var self 		= this;
	
	var fnCallBackMain = fnCallback;

	if(aFolders.length > 0){
		var oFolder	= aFolders.shift();
		var fnCallBack_inner = {};

		if(oFolder.folders.length > 0){
			fnCallBack_inner 	= function(){
				var fnCallBack_outter = function(){
					var sRootID2 	= sRootID;
					var aFolders2 	= aFolders;
					var fnCallBack2 = fnCallBackMain;
					self.cmis_createFolderArray(sRootID2,aFolders2,fnCallBack2);
				};

				self.cmis_createFolderArray(self.folders[oFolder.name],oFolder.folders,fnCallBack_outter);
			}
		}else{
			fnCallBack_inner 	= function(){
				self.cmis_createFolderArray(sRootID,aFolders,fnCallBackMain);
			}
		}
		self.cmis_createFolder(sRootID,oFolder.name,fnCallBack_inner);
	}else{
		fnCallBackMain();
	}
};

App.prototype.cmis_createFolder				= function(sRootID,sFolderName,fnCallback){
	var self = this;
	
	var fnCreateFolder = function(oData){
		//CHeck oData for a valid folder;
		if(oData != false){
			self.folders[sFolderName] = oData;//Save the object ID
			fnCallback();//Call the callback function
			return;
		}

		var d 		= 	new Date();
		var sTime 	= 	d.toISOString();
		var oItem 	=  	{
							bundleName:sFolderName,
							time:sTime
						}; 

		//No bundle folder, create one, then give me the ID of the item.
		var sUrl 	= self.settings.portalServerUrl + "/content/atom/contentRepository/children?id=" + sRootID + "&overwriteFlag=true";
		var oXML 	= Mustache.to_html(self.getTemplate("cmis_createFolder"),oItem);

		$.ajax({
			url:sUrl,
			type:"POST",
			dataType:"xml",
			contentType:"text/xml",
    		data:oXML
		}).done(function(data){
			var ooData = $.xml2json(data);
			$(ooData["object"]["properties"]["propertyId"]).each(function(index,item){
	            if(item["propertyDefinitionId"] == "cmis:objectId"){
	                sObjectID = item["value"];
	                return false;
	            }
	        });
			self.folders[sFolderName] = sObjectID;//Save the object ID
			fnCallback();//Call the callback function
		});
	};
	
	self.cmis_checkFolder(sRootID,sFolderName,fnCreateFolder);
};

App.prototype.cmis_uploadFiles				= function(){
	var self 		= this;

	var fnCallBack 	= function(){
		self.registerWidget();
		//create the manifest for mobile widget downloading
		self.upload_CMIS_manifest();
		console.log("Uploaded Files");
	};
	self.cmis_uploadFile(self.pathManifest,fnCallBack);
};

App.prototype.upload_CMIS_manifest 					= function(){

	var self 		= this;
	var sUrl 		= self.settings.portalServerUrl + "/content/upload/form";
	var docContent 	= JSON.stringify(self.replacePathList);
	
	console.log(docContent);

	var oItem = {
		name:"cmis_manifest.js",
		path:"",
		bundleName:self.cmisManifest.bundleName,
		widgetName:self.cmisManifest.widgetName,
		fileContent:docContent
	};

	var oData = self.cmis_buildPOST(oItem);

	debugger;

	$.ajax({
		url:sUrl,
		type:"POST",
		processData:false,
		contentType:false,
		data:oData
	}).done(function(data){
		console.log("Uploaded new file.");
	});	
};

App.prototype.cmis_uploadTemplateFiles				= function(){
	var self 		= this;

	var fnCallBack 	= function(){
		self.registerTemplate();
		console.log("Uploaded Files");
	};
	self.cmis_uploadFile(self.pathManifest,fnCallBack,true);
};

App.prototype.cmis_uploadFile				= function(aPathManifest,fnCallback,isTemplate){
	/*
	
		TO DO - Add condition to roll-back upload or alert on incomplete upload.

	*/

	var self 		= this;
	var sUrl 		= self.settings.portalServerUrl + "/content/upload/form";

	var isMedia 	= true;
	if(aPathManifest.media.length > 0){
		var oItem 		= 	{
								name:"",
								bundleName:self.cmisManifest.bundleName,
								path:"",
								widgetName:self.cmisManifest.widgetName,
								fileContent:""
							};
		
		oItem.path 				= 	aPathManifest.media.shift();
		oItem.name 				= 	oItem.path.slice(oItem.path.lastIndexOf("/") + 1,oItem.path.length);
		oItem.fileContent 	 	= 	self.cmisManifest.media[oItem.name];
		var oData 				= 	self.cmis_buildPOST(oItem,isTemplate);
	}else{
		isMedia = false;
		if(aPathManifest.files.length == 0){ 
			fnCallback();
			return;
		}		
		var oItem 		= 	{
								name:"",
								bundleName:self.cmisManifest.bundleName,
								path:"",
								widgetName:self.cmisManifest.widgetName,
								fileContent:""
							};

		var oItem2 		= 	{
								name:"",
								bundleName:self.cmisManifest.bundleName,
								path:"",
								widgetName:self.cmisManifest.widgetName,
								fileContent:""
							};
		

		oItem.path 				= 	aPathManifest.files.shift();
		oItem.name 				= 	oItem.path.slice(oItem.path.lastIndexOf("/") + 1,oItem.path.length);
		var sFileExt			=   oItem.path.slice(oItem.path.lastIndexOf(".") + 1,oItem.path.length);
		
		if(oItem.name == "manifest.js"){
			self.cmis_uploadFile(aPathManifest,fnCallback,isTemplate);
			return;
		}

		if(oItem.name == "index.html" && aPathManifest.files.length != 0){//Got to the index file too soon. Make sure it's the last file we change.
			aPathManifest.files.push(oItem.path);
			self.cmis_uploadFile(aPathManifest,fnCallback,isTemplate);
			return;
		}

		if(oItem.name == "style.css" && aPathManifest.files.length != 1){//Got to the main .css file too soon. Make sure it's the last file we change.
			aPathManifest.files.push(oItem.path);
			self.cmis_uploadFile(aPathManifest,fnCallback,isTemplate);
			return;
		}

		oItem.fileContent 	 	= 	(sFileExt == "css" || sFileExt == "html")?self.cmis_updateContent(self.cmisManifest.files[oItem.name],oItem.path):self.cmisManifest.files[oItem.name];
		var oData 				= 	self.cmis_buildPOST(oItem,isTemplate);
	}

	var sItemFolder		= (isTemplate == undefined)?"widgets":"templates";
	var sPath 			=   "/" + oItem.bundleName + "/" + sItemFolder + "/" + oItem.widgetName + "/" + oItem.path;
	var aPathManifest2 	= aPathManifest;
	var fnCallback2 	= fnCallback;

	self.progress_updateProgress(1,"Uploading files:  " + sPath);

	if(isTemplate != undefined && oItem.name == "index.html"){
		//Since this is a template, we will break out the head and body and upload them indipendantly.
		var sContentFile 	= oItem.fileContent;
		oItem.name 			= "head.html";		
		oItem.fileContent 	= self.extractHead(sContentFile);

		oItem2.name 		= "body.html";
		oItem2.fileContent	= self.extractBody(sContentFile);

		var oData 			= self.cmis_buildPOST(oItem,isTemplate);
		var oData2 			= self.cmis_buildPOST(oItem2,isTemplate);

		var sPath1						= "/" + oItem.bundleName + "/" + sItemFolder + "/" + oItem.widgetName + "/" + oItem.name;
		var sPath2						= "/" + oItem.bundleName + "/" + sItemFolder + "/" + oItem2.widgetName + "/" + oItem2.name;

		self.template.headerLocation 	= self.settings.portalServerUrl + "/proxy?pipe=mustachePipe&contentPath=" + sPath1 + "&nobrowsercache=true";
		self.template.bodyLocation 		= self.settings.portalServerUrl + "/proxy?pipe=mustachePipe&contentPath=" + sPath2 + "&nobrowsercache=true";

		$.ajax({
			url:sUrl,
			type:"POST",
			processData:false,
			contentType:false,
			data:oData
		}).done(function(data){
			$.ajax({
				url:sUrl,
				type:"POST",
				processData:false,
				contentType:false,
				data:oData2
			}).done(function(data){
				self.cmis_uploadFile(aPathManifest2,fnCallback2,isTemplate);
			});
		});	
		return false;
	}

	$.ajax({
		url:sUrl,
		type:"POST",
		processData:false,
		contentType:false,
		data:oData
	}).done(function(data){
		var fnCallbackInner = function(){
			self.cmis_uploadFile(aPathManifest2,fnCallback2,isTemplate);
		}
		/*
		self.replacePathList.push({
        	oldPath:oItem.path,
        	newPath:sPath
        });
		*/
		//self.cmis_uploadFile(aPathManifest2,fnCallback2,isTemplate);
		self.cmis_getPath(sPath,oItem.path,fnCallbackInner);
	});	

};

App.prototype.cmis_uploadWidget				= function(){
	conole.log("Uploading widget");

	var self = this;

	//Let's start by creating the folders based on the manifest file.
	self.cmis_createWidget();

	$(self.cmisManifest.folders).each(function(index,item){
		self.cmis_createFolder(item);
	});

};

App.prototype.escape = function(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

App.prototype.cleanWidget_XML				= function(sXML){
	var self 		= this;
	var test1 		= self.escape("$(contextRoot)/static/" + self.cmisManifest.bundleName + "/widgets/" + self.cmisManifest.widgetName + "/");
	var test 		= new RegExp(test1,"g");
	sXML 			= sXML.replace(test,"");

	return sXML;
};

App.prototype.registerWidget				= function(){
	var self 		= this;
	var sUrl 		= self.settings.portalServerUrl + "/catalog.xml";
	//First update the widget XML with new pathnames.
	var sWidgetXML  = self.cleanWidget_XML(self.cmisManifest.modelXML);
	var sContent 	= self.cmis_updateContent(sWidgetXML,"");

	console.log(sContent);


	sContent 		= sContent.replace("<widgets>","<catalog>");
	sContent 		= sContent.replace("</widgets>","</catalog>");

	if($(".registerBoolean").attr('checked') != 'checked'){
		self.progress_updateProgress(90,"Nevermind, you said DON'T register the widget.");
		self.progress_updateProgress(100,"Done!");
		$("#modal_progress_uploadWidget").modal('hide');
		self.nextPage();
		return false;
	}

	self.progress_updateProgress(40,"Registering widget...");

	$.ajax({
		url:sUrl,
		type:"POST",
		contentType:"text/xml",
		data:sContent,
		success:function(data){
			self.progress_updateProgress(100,"Done!");
			console.log("Finished registering widget!");
			$("#modal_progress_uploadWidget").modal('hide');
			self.nextPage();
		},
		error:function(data){
			self.progress_updateProgress(100,"Done!");
			console.log("Error registering widget!");
			$("#modal_progress_uploadWidget").modal('hide');
			$("#modal_error_badRegister").modal('show');	
		}
	}).done(function(data){
		console.log('done');
	});
};

App.prototype.registerTemplate				= function(){
	var self 		= this;
	var sUrl 		= self.settings.portalServerUrl + "/templates.xml";
	var sContent 	= Mustache.to_html(self.getTemplate("template_xml"),self.template);

	self.progress_updateProgress(40,"Registering template...");

	$.ajax({
		url:sUrl,
		type:"POST",
		contentType:"text/xml",
		data:sContent,
		success:function(data){
			self.progress_updateProgress(100,"Done!");
			console.log("Finished registering template!");
			$("#modal_progress_uploadWidget").modal('hide');
			self.nextPage();
		},
		error:function(data){
			self.progress_updateProgress(100,"Done!");
			console.log("Error registering template!");
			$("#modal_progress_uploadWidget").modal('hide');
			$("#modal_error_badRegister").modal('show');	
		}
	}).done(function(data){
		console.log('done');
	});
}

App.prototype.resetApp						= function(){
	chrome.runtime.reload();
};

App.prototype.storeUploadSettings			= function(){
	var self	= this;

	self.settings.portalServerUrl 		= ($("#portalserverurl").val() != "")?$("#portalserverurl").val():$("#portalserverurl2").val();
	self.settings.portalServerUserName 	= ($("#portalserverUsername").val() != "")?$("#portalserverUsername").val():$("#portalserverUsername2").val();
	self.settings.portalServerPassword 	= ($("#portalserverPassword").val() != "")?$("#portalserverPassword").val():$("#portalserverPassword2").val();
};

App.prototype.nextPage						= function(step){
	var self 	= this;
	var aItem1 	= $(".page_section div.step");
	var aItem2	= $("div.page.step");

	step = (step==undefined)?1:step;


	if(step == "upload"){
		self.currentPage = self.currentPage;
		step = 1;
	}else{
		self.currentPage = self.currentPage + step;
		if(self.currentPage == 10 || self.currentPage == 13){
			var fnCallBack = function(){
				self.nextPage("upload");
			}
			self.cmis_login(fnCallBack);
			return;
		}
	}

	$(aItem1[self.currentPage - step]).animate({
		opacity:0
	},300,function(){
		$(this).css("display","none");
		$(aItem1[self.currentPage]).css("display","block");
		$(aItem1[self.currentPage]).animate({
			opacity:1
		},300);
	});

	$(aItem2[self.currentPage - step]).animate({
		opacity:0
	},300,function(){
		$(this).css("display","none");
		$(aItem2[self.currentPage]).css("display","block");
		$(aItem2[self.currentPage]).animate({
			opacity:1
		},300,function(){
			console.log("inside the switch statement");

			switch(self.currentPage){
				case 3:
					console.log("Save Page 3");
					self.buildWidgetXML();
					break;
				case 4:
					console.log("Save Page 4");
					self.showChromes();
					break;
				case 5:
					console.log("Save Page 5");
					self.showLibraries();
					break;
				case 6:
					console.log("Loading in External Libraries");
					self.buildExt();
					self.buildWidgetHTML();
					self.renderEditor();
					break;
				case 7:
					console.log("saving new widget definition");
					self.widgetHTML = self.editor2.getValue();
					self.widgetCtrl = self.editor1.getValue();
					self.widgetCSS  = self.editor3.getValue();
					chrome.app.window.get("demoWindow").close();
				default:
					break;
			}

			if(self.currentPage == 4){
				self.showChromes();
			}
			if(self.currentPage == 5){
				self.showLibraries();
			}
		});
	});

};

App.prototype.prevPage						= function(){
	var self 	= this;
	var aItem1 	= $(".page_section div.step");
	var aItem2	= $("div.page.step");

	self.currentPage = self.currentPage - 1;

	$(aItem1[self.currentPage + 1]).animate({
		opacity:0
	},300,function(){
		$(this).css("display","none");
		$(aItem1[self.currentPage]).css("display","block");
		$(aItem1[self.currentPage]).animate({
			opacity:1
		},300);
	});

	$(aItem2[self.currentPage + 1]).animate({
		opacity:0
	},300,function(){
		$(this).css("display","none");
		$(aItem2[self.currentPage]).css("display","block");
		$(aItem2[self.currentPage]).animate({
			opacity:1
		},300);
	});

};

App.prototype.validateForm				= function(){
	var self 		= this;
	var valid		= true;
	var inputs 		= $(self.currentPage).find(".widgetProps").find("input");

	$(inputs).each(function(index,item){
		if($(item).val() == ""){
			//Place the error style on it and keep the next button disabled.
			$(item).parents(".form-group").addClass('has-error');
			valid = false;
		}else{
			//Take off the error style just in case the user fixed it.
			$(item).parents(".form-group").removeClass('has-error');
			$(item).parents(".form-group").addClass('has-success');
		}
	});

	if(valid == false){
		$(".widgetProps").parents(".container").find(".btn-next").addClass("disabled");
	}else{
		$(".widgetProps").parents(".container").find(".btn-next").removeClass("disabled");
	}

};

App.prototype.validateFormTemplate				= function(){
	var self 		= this;
	var valid		= true;
	var inputs 		= $(self.currentPage).find(".templateProps").find("input");

	$(inputs).each(function(index,item){
		if($(item).val() == ""){
			//Place the error style on it and keep the next button disabled.
			$(item).parents(".form-group").addClass('has-error');
			valid = false;
		}else{
			//Take off the error style just in case the user fixed it.
			$(item).parents(".form-group").removeClass('has-error');
			$(item).parents(".form-group").addClass('has-success');
		}
	});

	if(valid == false){
		$(".templateProps").parents(".container").find(".btn-next").addClass("disabled");
	}else{
		$(".templateProps").parents(".container").find(".btn-next").removeClass("disabled");
	}
}

App.prototype.validateUploadForm				= function(){
	var self 		= this;
	var valid		= true;
	var inputs 		= $(".uploadProps").find("input");

	$(inputs).each(function(index,item){
		if($(item).val() == ""){
			//Place the error style on it and keep the next button disabled.
			$(item).parents(".form-group").addClass('has-error');
			valid = false;
		}else{
			//Take off the error style just in case the user fixed it.
			$(item).parents(".form-group").removeClass('has-error');
			$(item).parents(".form-group").addClass('has-success');
		}
	});

	if(valid == false){
		$(".uploadProps").parents(".container").find(".btn-next").addClass("disabled");
	}else{
		$(".uploadProps").parents(".container").find(".btn-next").removeClass("disabled");
	}

};

App.prototype.validateUploadTemplateForm				= function(){
	var self 		= this;
	var valid		= true;
	var inputs 		= $(".uploadTemplateProps").find("input");

	$(inputs).each(function(index,item){
		if($(item).val() == ""){
			//Place the error style on it and keep the next button disabled.
			$(item).parents(".form-group").addClass('has-error');
			valid = false;
		}else{
			//Take off the error style just in case the user fixed it.
			$(item).parents(".form-group").removeClass('has-error');
			$(item).parents(".form-group").addClass('has-success');
		}
	});

	if(valid == false){
		$(".uploadTemplateProps").parents(".container").find(".btn-next").addClass("disabled");
	}else{
		$(".uploadTemplateProps").parents(".container").find(".btn-next").removeClass("disabled");
	}

};

App.prototype.getTemplate				= function(name){
	return $('[data-template="'+name+'"]').html();
};

App.prototype.bindEnumButtons		= function(oTarget){
	var self = this;

	$(oTarget).find(".preference_enum_add").on("click",function(){
		self.addEnum(this);
	});

	$(oTarget).find(".preference_enum_delete").on("click",function(){
		self.removeEnum($(this).parents(".enum"));
	});
};

App.prototype.changeType				= function(oTarget){
	var self 	= this;
	var sVal	= $(oTarget).val();
	var oEnum	= $(oTarget).parents("form").find(".enum");
	
	if(sVal == "radio" || sVal == "range" || sVal == "select-one" || sVal == "select-many"){
		//get the block size
		$(oEnum).css("display","block");
		$(oEnum).height('auto');
		var iEnumHeight = $(oEnum).height();		
		$(oEnum).height(0);
		//Animate the height
		$(oEnum).transition({
			height:iEnumHeight,
			opacity:1
		},500,'snap');

		//Bind the preference buttons
		self.bindEnumButtons(oEnum);
	}else{
		//Animate the height to 0
		$(oEnum).transition({
			height:0,
			opacity:0
		},500,'snap');
	}
	//Wipe out the preference default value for good measure.
	$(oTarget).parents("form").find(".preference_default").val("");
};

App.prototype.addPreference				= function(item){
	var self 	= this;
	var isRight = true;
	var oInputs = $(item).parents("form.newPreference").find("input");

	//Make sure all the inputs have an entry
	$(oInputs).each(function(index,item){
		if($(item).val() == "" && $(item).attr("type") != "checkbox" && $(item).attr("name") != "hidden"){
			isRight = false;
			return false;
		}
	});

	if(isRight == false){
		$(item).parents("form").addClass("alert alert-danger");
		return false;
	}//Kill the button press if it's not correct

	$(item).parents("form").addClass("alert alert-success");
	$(item).parents("form").find(".preference_delete").removeClass("disabled");

	self.savePreference($(item).parents("form"));

	var oTarget = $(".container_preferences");
	var oData	= {};
	var oView 	= Mustache.to_html(self.getTemplate("preference_field"),oData);

	$(oTarget).prepend(oView);

	var oNewForm 		= $(oTarget).find(".newPreference");
	var iNewHeight  	= $(oNewForm).height();


	$(oNewForm).height(0);

	$(oNewForm).transition({
		height:iNewHeight,
		opacity:1,
		x:0
	},300,'snap',function(){
		//I have no idea why I need to do this! Without it I get double bound elements.
		if(this.bound == undefined){
			self.bindPreferenceButtons(this);
			$(this).height('auto');
			$(this).removeClass("newPreference");
			this.bound = true;
		}
	});
};

App.prototype.removePreference				= function(oTarget){
	var self 		= this;
	var oParent		= $(oTarget).parents(".container_preferences");
	var oPrefs		= [];

	$(oParent).find("form").each(function(index,item){
		if(item == oTarget[0]){
			$(item).transition({
				opacity:0,
				x:-30
			},300,'snap').transition({
				height:0,
				margin:0,
				padding:0
			},300,function(){
				$(item).remove();
			});
		}else{
			oPrefs.push(self.preferences[index]);
		}
	});
	
	self.preferences = oPrefs;
};

App.prototype.bindPreferenceButtons		= function(oTarget){
	var self = this;

	console.log("binding");

	$(oTarget).find(".preference_add").on("click",function(){
		self.addPreference(this);
	});

	$(oTarget).find(".preference_delete").on("click",function(){
		self.removePreference($(this).parents("form"));
	});

	$(oTarget).find(".preference_type").on("change",function(){
		self.changeType(this);
	});

	$(oTarget).find(".preference_details").on("click",function(){
		if($(this).hasClass("disabled"))return false;
		self.showPrefEditModal(sVal);
	});

};

App.prototype.removeEnum				= function(oTarget){
	var self 		= this;
	var oParent		= $(oTarget).parents(".enumerations");
	var oEnums		= [];

	$(oParent).find(".enum").each(function(index,item){
		if(item == oTarget[0]){
			$(item).transition({
				opacity:0,
				x:-30
			},300,'snap').transition({
				height:0,
				margin:0,
				padding:0
			},300,function(){
				$(item).remove();
			});
		}else{
			oEnums.push(self.enumerations[index]);
		}
	});
	
	self.enumerations = oEnums;
};

App.prototype.savePreference				= function(oTarget){
	var self 		= 	this;
	var preference 	= 	{	
							name:"",
							label:"",
							type:"",
							default:"",
							roles:"",
							designMode:"",
							rangeLow:"",
							rangeHigh:"",
							step:"",
							enum:[]
						};

	//Turn off all the inputs. Only way to change is to delete.
	$(oTarget).find("input").attr("disabled","");
	$(oTarget).find("select").attr("disabled","");
	$(oTarget).find(".btn").addClass("disabled");
	$(oTarget).find(".btn.btn-danger").removeClass("disabled");

	//Store the values
	preference.name 		= $(oTarget).find(".preference_name").val();
	preference.label 		= $(oTarget).find(".preference_label").val();
	preference.type 		= $(oTarget).find(".preference_type").val();
	preference.default 		= $(oTarget).find(".preference_default").val();
	preference.roles 		= ($(oTarget).find(".preference_role").val() != null)?$(oTarget).find(".preference_role").val().join(","):"";
	preference.designMode 	= ($(oTarget).find(".preference_designMode").attr("checked"))?",designModeOnly":"";
	preference.rangeLow 	= ($(oTarget).find(".preference_rangeLow").val() != "")?$(oTarget).find(".preference_rangeLow").val():false;
	preference.rangeHigh 	= ($(oTarget).find(".preference_rangeHigh").val()!= "")?$(oTarget).find(".preference_rangeHigh").val():false;
	preference.step 		= $(oTarget).find(".preference_step").val();

	//Build the enumeration size;
	var sVal = preference.type;
	if(sVal == "radio" || sVal == "range" || sVal == "select-one" || sVal == "select-many"){
		preference.enum 		= self.enumerations;
	}

	//Save the preferences.
	self.preferences.push(preference);
	self.enumerations 		= [];
};

App.prototype.saveEnumeration				= function(oTarget){
	var self 		= 	this;
	var enumeration = 	{	
							name:"",
							sVal:"",
						};

	//Turn off all the inputs. Only way to change is to delete.
	$(oTarget).find("input").attr("disabled","");
	$(oTarget).find(".btn").addClass("disabled");
	$(oTarget).find(".btn.btn-danger").removeClass("disabled");

	//Store the values
	enumeration.name 		= $(oTarget).find(".enum_label").val();
	enumeration.sVal 		= $(oTarget).find(".enum_value").val();
	
	//Build the enumeration size;

	//Save the preferences.
	self.enumerations.push(enumeration);
};

App.prototype.addEnum				= function(item){
	var self 	= this;
	var isRight = true;
	var oInputs = $(item).parents("div.enum").find("input");

	//Make sure all the inputs have an entry
	$(oInputs).each(function(index,item){
		if($(item).val() == ""){
			isRight = false;
			return false;
		}
	});

	if(isRight == false){
		$(item).parents("div.enum").addClass("alert alert-danger");
		return false;
	}//Kill the button press if it's not correct

	$(item).parents("div.enum").addClass("alert alert-success");
	$(item).parents("div.enum").find(".preference_enum_delete").removeClass("disabled");

	self.saveEnumeration($(item).parents("div.enum"));

	var oTarget = $(item).parents("form").find(".enumerations");
	var oData	= {};
	var oView 	= Mustache.to_html(self.getTemplate("preference_enum_setup"),oData);

	$(oTarget).prepend(oView);

	var oNewForm 		= $(oTarget).find(".new_enum");
	$(oNewForm).css('display','block');
	var iNewHeight  	= $(oNewForm).height();

	$(oNewForm).height(0);

	$(oNewForm).transition({
		height:iNewHeight,
		padding:15,
		margin:5,
		opacity:1,
	},300,'snap',function(){
		self.bindEnumButtons(oNewForm);
		$(this).height('auto');
		$(oNewForm).removeClass("new_enum");
	});
};

App.prototype.showChromes					= function(){
	var self 	= this;
	var oTarget = $(".container_chromes");
	var oView 	= Mustache.to_html(self.getTemplate("chrome_images"),chromeLocations);

	$(oTarget).html(oView);

	//Now flip in the items.
	$(oTarget).find(".container_chrome").each(function(index,item){
		var delayAmount = 100 * index;
		$(item).transition({ 
								opacity:1,
								perspective: '100px',
  								rotateY: '360deg', 
  								delay:delayAmount 
  							},function(){
  								$(this).css("-webkit-transform","none");
  							});

		$(item).on("click",function(){
			$(oTarget).find(".selected").removeClass("selected");
			$(this).addClass("selected");
			var innerSelf = $(this);
			//Store the chrome identifier in memory.
			$(chromeLocations.images).each(function(index,item){
				if(item.identifier == $(innerSelf).attr("chromeID")){
					self.chrome = item;
					return false;
				}
			});
		});
	});

	return true;
};

App.prototype.showLibraries					= function(){
	var self 	= this;
	var oTarget = $(".container_libraries");
	var oView 	= Mustache.to_html(self.getTemplate("library_images"),libraryLocations);

	$(oTarget).html(oView);

	//Now flip in the items.
	$(oTarget).find(".container_library").each(function(index,item){
		var delayAmount = 100 * index;
		var newOpacity  = ($(item).hasClass("disabled"))?0.4:1;
		$(item).transition({ 
								opacity:newOpacity,
								perspective: '100px',
  								rotateY: '360deg', 
  								delay:delayAmount 
  							},function(){
  								$(this).css("-webkit-transform","none");
  							});

		$(item).on("click",function(){
			if($(item).hasClass("disabled")){return true;}
			$(oTarget).find(".selected").removeClass("selected");
			$(this).addClass("selected");
		});
	});

	return true;
};

App.prototype.buildWidgetXML				= function(){
	var self 		= this;
	
	//Build out the base widget json object to be passed into mustache for processing.
	self.widget.name  			= 	$("#widget_name").val();
	self.widget.identifier 		= 	self.widget.name.replace(/ /g,"_") + "_" + Math.floor(Math.random()*99999);
	self.widget.author 			= 	$("#widget_author").val();
	self.widget.description 	= 	$("#widget_description").val();
	self.widget.bundle 			= 	$("#widget_bundle").val();
	self.widget.preferences 	= 	self.preferences;
	self.widgetXML 				=   Mustache.to_html(self.getTemplate("widget_xml"),self.widget);
	self.widgetCtrl 			=   Mustache.to_html(self.getTemplate("controller_javascript"),self.widget);
	self.widget.name  			= 	$("#widget_name").val().replace(/ /g,"_");
	return true;
}

App.prototype.buildWidgetHTML 				= function(){
	var self 			= this;
	self.widgetHTML  	= Mustache.to_html(self.getTemplate("widget_html"),self.widget);

	return true;
}

App.prototype.buildExt = function(){
	var self 		= this;

	//Add the appropriate Widget Chrome
	$.ajax({
			url: "resources/chromes/"+self.chrome.folder_loc+"/"+self.chrome.index_name,
			async: true,
			dataType:"text",
			success:function(data){
				console.log("done loading chrome html");
				self.chrome.fileContent = data;
			}
	}).done(function(data) {
	});

	//First find out which library we need to load (if any)
	var libIdent 	= $(".container_library.selected");

	if(libIdent.length == 0){return false;}

	//Now get the JS Identification of the selected library via manifest
	$(libraryLocations.libraries).each(function(index,item){
		if(item.identifier == $(libIdent).attr("identifier")){
			self.widget.library.externalJS				=   {
																folderLoc:item.folder_loc,
																fileLoc:item.js_loc,
																fileContent:""
															}
			if($(libIdent).find(".library_includeCSS").attr("checked")=="checked"){
				self.widget.library.externalCSS				=   {
																folderLoc:item.folder_loc,
																fileLoc:item.css_loc,
																fileContent:""
															}
			}
		}
	});
	
	//Adding the external libraries that were selected.
	$.ajax({
			url: "resources/libraries/"+self.widget.library.externalJS.folderLoc+"/"+self.widget.library.externalJS.fileLoc,
			async: true,
			dataType:"text",
			success:function(data){
				self.widget.library.externalJS.fileContent = data;
				if(self.widget.library.externalCSS != false){
					$.ajax({
								url: "resources/libraries/"+self.widget.library.externalCSS.folderLoc+"/"+self.widget.library.externalCSS.fileLoc,
								async: true,
								dataType:"text",
								success:function(data){
									self.widget.library.externalCSS.fileContent = data;
									//self.buildZip();
								}
							}).done(function(data) {
							});
				}else{
					//self.buildZip();
				}
			}
		}).done(function(data) {
		});

	return true;
}

App.prototype.buildZip 						= function(forDemo){
	var self 		= this;
	
	forDemo = typeof forDemo !== 'undefined' ? forDemo : false;

	var zip 		= new JSZip();
	
	var f_chrome	= zip.folder("chrome");
	var f_css 		= zip.folder("css");
	var f_js 		= zip.folder("js");
	var f_resources = zip.folder("resources");
	var f_img 		= zip.folder("img");

	zip.file("icon.png", iconFile, {base64: true});

	console.log("************* This is the widget XML *************");
	console.log(self.widgetXML);

	zip.file("widget.xml",self.widgetXML);
	zip.file("index.html",self.widgetHTML);
	zip.file("manifest.js",'{"bundleName":"' + $("#widget_bundle").val() + '","widgetName":"' + self.widget.identifier + '"}');

	//Widget Style (empty stylesheet for now)
	f_css.file(self.widget.name.replace(/ /g,"_")+".css",self.widgetCSS);
	
	if(self.widget.library.externalCSS != false){
		f_css.file(self.widget.library.externalCSS.fileLoc,self.widget.library.externalCSS.fileContent);//Widget Style
	}
	
	//Widget Controllers (template we get from mustache.)
	f_js.file(self.widget.name.replace(/ /g,"_")+".js",self.widgetCtrl);

	if(self.widget.library.externalJS != false){
		f_js.file(self.widget.library.externalJS.fileLoc,self.widget.library.externalJS.fileContent);//Widget Style
	}

	//Widget Chrome
	if(self.chrome.title != undefined){
		f_chrome.file("chrome.html",self.chrome.fileContent);//Widget Style
	}
	
	var content 	= zip.generate({type:"blob"});
	var fileName 	= self.widget.identifier + ".zip";
	var config 		= {type: 'saveFile', suggestedName: fileName};
	
	self.zippedFile = content;

	if(forDemo != true){
		self.killSession();
		writeFile(content,config);
	}
};

App.prototype.uploadZip						= function(fileName,sUrl){
	var self 		= this;
	var content 	= this.zippedFile;
	var oData 		= new FormData();

	//Create the file to be uploaded.
	var blob = new Blob([content], {
			type: "application/zip"
		});

	oData.append("file",blob,fileName);	

	sUrl = "http://www.thenerdnomad.com/uploadingWidget.php?bundleName=" + self.widget.bundle;

	$.ajax({
		url:sUrl,
		type:"POST",
		processData:false,
		contentType:false,
		data:oData,
		success:function(cookieValue){
			self.cookieVal = cookieValue;
			//Complete the done function.
			//Open iFrame window
			setTimeout(function(){
				self.openEditWindow(self.cookieVal);
			},3000);
			//Refresh content
		}
	}).done(function(data){
		//Done
	});	
};

App.prototype.killSession				= function(){
	var self = this;
	sUrl = "http://www.thenerdnomad.com/killSession.php?cookieVal=" + self.cookieVal;

	$.ajax({
		url:sUrl,
		type:"GET"
	}).done(function(data){
	});	
}

App.prototype.openEditWindow			= function(cookieVal){
	var self = this;

	chrome.app.window.create("/demoContent.html", {
		id:"demoWindow",
		frame:"chrome",
		bounds:{
			height:600,
			width:800
		}
	}, function(createdWindow){
		var fnEdit = function(){
			var bundle 		= self.widget.bundle;
			var identifier	= self.widget.identifier;
			var sHTML 		= '<webview src="http://www.thenerdnomad.com/portalserver/main.php?cookieValue=' + cookieVal + '&bundleName=' + bundle + '&widgetName=' + identifier + '" height="100%" width="100%"></webview>';
			createdWindow.contentWindow.setTimeout(function(){
				$(createdWindow.contentWindow.document.body).html(sHTML);
				self.hideLoadingMessage();
			},1000);
		}

		fnEdit();
	});
};

App.prototype.deleteTemps				= function(){
	var self = this;

	$.ajax({
		url:"http://www.thenerdnomad.com/killSession.php"
	}).done(function(data){
		//Process the result.
		console.log("Killed session data.");
		console.log(data);
	});
};

function errorHandler(e) {
  console.error(e);
}

function writeFileEntry(writableEntry, opt_blob, callback) {
  if (!writableEntry) {
    //output.textContent = 'Nothing selected.';
    return;
  }

  writableEntry.createWriter(function(writer) {

    writer.onerror = errorHandler;
    writer.onwriteend = callback;

    // If we have data, write it to the file. Otherwise, just use the file we
    // loaded.
    if (opt_blob) {
      writer.truncate(opt_blob.size);
      waitForIO(writer, function() {
        writer.seek(0);
        writer.write(opt_blob);
      });
    } else {
      chosenFileEntry.file(function(file) {
        writer.truncate(file.fileSize);
        waitForIO(writer, function() {
          writer.seek(0);
          writer.write(file);
        });
      });
    }
  }, errorHandler);
}

function waitForIO(writer, callback) {
  // set a watchdog to avoid eventual locking:
  var start = Date.now();
  // wait for a few seconds
  var reentrant = function() {
    if (writer.readyState === writer.WRITING && Date.now() - start < 4000) {
      setTimeout(reentrant, 100);
      return;
    }
    if (writer.readyState === writer.WRITING) {
      console.error("Write operation taking too long, aborting!" +
        " (current writer readyState is " + writer.readyState + ")");
      writer.abort();
    } else {
      callback();
    }
  };
  setTimeout(reentrant, 100);
}

function writeFile(content,config){
	var self = this;

	chrome.fileSystem.chooseEntry(config, function(writableEntry) {
		var blob = new Blob([content], {
			type: 'application/octet-stream'
		});
		writeFileEntry(writableEntry, content, function(e) {
			console.log("Done writing data");
			self.resetApp();
		});
	});
}

function readAsText(fileEntry, callback) {
	fileEntry.file(function(file) {
		var reader = new FileReader();

		reader.onload = function(e) {
			callback(e.target.result);
		};

		reader.readAsDataURL(file);
	});
}

var iconFile = "";
//HTML5 for dragging in widget icon image
var dnd = new DnDFileController('#thumbnail', function(data) {
	chosenFileEntry = null;
	for (var i = 0; i < data.items.length; i++) {
		var item = data.items[i];
		if (item.kind == 'file' &&
			item.type.match('image/*') &&
			item.webkitGetAsEntry()) {
			chosenFileEntry = item.webkitGetAsEntry();
			break;
		}
	};

	readAsText(chosenFileEntry, function(result) {
		$("#thumbnail").css("display","none");
		var image 		= $(".thumbnail")[0];
		image.src 		= result;
		
		//Now let's re-size the image
		var height 		= 63 / $(".thumbnail").height();
		var width 		= $(".thumbnail").width();
		var iWidth 		= width * height;
		var yOffset		= (87 - iWidth) / 2;

		var c=document.getElementById("myCanvas");
		var ctx=c.getContext("2d");
		ctx.drawImage(image,yOffset,0,iWidth,63);

		var iconFile1 = c.toDataURL("image/png");
		iconFile = iconFile1.replace(/^data:image\/(png|jpg);base64,/, "");
	});
});