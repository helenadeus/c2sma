//$(document).ready(function() { $('#submitList').click(); });
//var serviceBaseURL = "http://cactus.nci.nih.gov/chemical/structure/";//not working!! service down a lot? if so, forget about using it :-(
var chemSpiderTok = "2913cb9b-a281-4752-b582-5fe15a663884";
var chemSpiders = {};
var totalSpiderCalls = 0;var totalSpiderCallsFinal = 0;
//var spiderIDcallNum = 0;var spiderIDcallTot = 0;
var parseChem = function (chemList) {
	//to avoid overwritting, clear the secton first
	$('#chemical_struc_ul').html('');
	$.mobile.pageLoading(); 
	//assumign chemList is separated by \n
	var list = $.unique($('#chems').val().trim().split(/\n/));
	
		
	//now, one by one, try to find them using cactus;
	//cactus has no json service; use php...
	
	//we also need to create as many divs inside block 2 as there are chemicals
	totalSpiderCallsFinal = list.length;
	for (var i=0; i<list.length; i++) {
		var n = list[i].toLowerCase();
		//append li and create the rest of the stuff
				var domElement = "element_"+i;
				$('#chemical_struc_ul').append(
							'<li>'+
								'<a href="#page_'+i+'" id="element_'+i+'"><h3>'+list[i]+'</h3>'+
								'<h4>Is this the '+list[i]+' you are looking for?</h4>'+
								//'<a onclick="learnChem(\"'+n+'\", 1)" id="element_'+i+'"></a>'+
								//'<a onclick="learnChem(\"'+n+'\", 0)" id="element_'+i+'"></a>'+
								'</a>'+
							'</li>'
								
					)
				//also create the yes, no and maybe pages for this element.
				var chemPage = '<div data-role="page">

					<div data-role="header">
						<h1>Page Title</h1>
					</div>
					<div data-role="content">	
						<p>Page content goes here.</p>		
					</div>

					<div data-role="footer">
						<h4>Page Footer</h4>
					</div>
				</div>'
				
				
				"
				$('body').append('<div data-role="page" id="#page_'+i+'">'+
				
				
				'</div>');


	//find it, first on chemspider	
		//var callthisURL = serviceBaseURL+n+"/chemspider_id";//service down
		getChemSpiderID(list[i], domElement, 0);
		
	}
	
}

var getChemSpiderID = function (rawName, domElement, altered) {
			//if this was altered, will need ot specify that somewhere in the output to avoid returning to this point
			var n = escape(rawName.toLowerCase());
			var callChemSpider = "http://www.chemspider.com/Search.asmx/SimpleSearch?query="+n+"&token="+chemSpiderTok;
			var callPHP = "xml2json.php?url="+escape(callChemSpider)+"&name="+rawName+"&domid="+domElement+"&service=SimpleSearch";
			
			
			$.ajax({
			  url: callPHP,
			  success: function (data) {
					//totalSpiderCalls++;
					//data here is just the chemspider id; next, for each id, need to find info on chemspider about it so that the user can confirm it
					var d = JSON.parse(data);
					if(d[0]=="true"){
						//there can zero, one, or a list of chemspider IDS; the next 
						
						var domid = d[2];
						var n = escape(d[1].toLowerCase());
						var chemSpidID = d[3];
						
						var chemSpidList = [];
						
						for (var i in d[3]) {
							chemSpidList.push(d[3][i]);
						}
						
						//switch  based on ## of reuslts
						if(chemSpidList.length==0){
							
						}	
						else if (chemSpidList.length==1) {
							
							var id = chemSpidID[0];
							
							chemSpiders[id] = {};
							chemSpiders[id]['totalCalls'] =  2;
							chemSpiders[id]['currentCall'] =  0;
							//spiderIDcallNum = 0; //reset
							getChemSpiderData(id, n, domid, altered);
							getChemSpiderThumb(id, n, domid, altered);
						}
						else {
							//list > 1
							//get data for each
						}
						
					}
					else {
						//indicate that this could not be found; prompt to edit
						if(!altered){
							var n = escape(d[1].toLowerCase());
							var domid = d[2];
							stringSimilarity(n, domid);
						}
						else {
							//error msg;
							$('#errors').show();
							$('#errors_found').append();
						}

					}

			  }
			  
	});
}

var getChemSpiderData = function (chemSpidID, n, domid) {
	//get chemspider data relies on service GetCompoundInfo
	
	var serviceCall = "http://www.chemspider.com/Search.asmx/GetCompoundInfo?csid="+chemSpidID+"&token="+chemSpiderTok;
	var callPHP = "xml2json.php?url="+escape(serviceCall)+"&id="+chemSpidID+"&domid="+domid+"&service=GetCompoundInfo&name="+n;
	
	$.ajax({
		  url: callPHP,
		  success: function (data) {
			//for keeping track of what came back already
			
			//obsessivelly save the data in cache
			//pars
			
			var d = JSON.parse(data);
			
			if(d[0]=='true'){
				//curious thing is that chemspider can return an ID, but the name may not match what what provided; user must be asked if that is what they meant with the name
				var name = d[1];
				var id = d[2];
				var domid = d[3];
				
				
				
				chemSpiders[id]['info'] = d[4];
				
				//keep track of how many ajax calls came back
				chemSpiders[id]['currentCall']++;
				
				if(chemSpiders[id]['currentCall']>=chemSpiders[id]['totalCalls']){
					displayChemData(n, id, domid, chemSpiders[id]);
				}
				
			}
		  }
		  });
		 
}

var getChemSpiderThumb = function (chemSpidID, n, domid) {
	var serviceCall = "http://www.chemspider.com/Search.asmx/GetCompoundThumbnail?id="+chemSpidID+"&token="+chemSpiderTok;
	var callPHP = "xml2json.php?url="+escape(serviceCall)+"&id="+chemSpidID+"&domid="+domid+"&service=GetCompoundThumbnail&name="+n;
	
	$.ajax({
		  url: callPHP,
		  success: function (data) {
				//spiderIDcallNum++;
				//data here is just the chemspider id; next, for each id, need to find info on chemspider about it so that the user can confirm it
				var d = JSON.parse(data);
				//if everything worked out OK, d[2] should have the location of the img. Time to give it to the user!
				var n = d[1];
				var id = d[2];
				var domid = d[3];
				var thumb = d[4];
				chemSpiders[id]['thumb']=thumb;
				
				//keep track of how many ajax calls came back
				chemSpiders[id]['currentCall']++;
				
				
				//trick to make sure totalSpiderCalls only increases when both data and thumb are available
				if(chemSpiders[id]['currentCall']>=chemSpiders[id]['totalCalls']){
					displayChemData(n, id, domid, chemSpiders[id]);
				}
				
		  }
	})
}
var stringSimilarity = function(n, domid){
	//this basiucally means nothing was found for n; user can replace the descriptor and look again or edit the molecule
	//one of most common things to do is to look for the pattern in parenthesis. 
	var newN = patternSplit(unescape(n), "()");
	if(newN){
	//find out about one of these in chemspider
	 getChemSpiderID(newN, domid, 1);
	}
}

var patternSplit = function (s1, patt) {
	//split the first (to match) string
	if(patt=='()'){
		var m = s1.match(/\((.*)\)/);
		if(m){
			//find the one with the largest lev distane and return that one
			 return m[1]
		}
	}
  }
 
function displayChemData(n, id, domid, chemSpiderIdData){
			//add the image to the div
			
			$('#'+domid).append('<img src="'+chemSpiderIdData['thumb']+'" size="200px" title="'+n+'"/>');
			//$('#chemical_struc_div').append('<li><h2>'+n+'</h2><a href="#'+n+'"><img src="'+imgsrc+'"></a></li>');

			//does does not really need to be here but this way we make sure that totalSpiderCalls only increases when all daa is available
			totalSpiderCalls++;
			//this makes sure that the listview is refreshed when all data is available
			
			if(totalSpiderCalls==totalSpiderCallsFinal){
				$('#chemical_struc_ul').listview('refresh');	
				$('#dblcheck').show();
				$.mobile.pageLoading(true);     
			}
			
			
					
}

var learnChem = function(chemName, match){
	console.log(chemName);
}


function loadChemWriter(sdf) {
	chemwriter.loadEditor('editor', {
        licensePath: '/chemwriter.lic',
        molfile:    'C9H14OS3\nAPtclcactv06301108302D 0   0.00000     0.00000\n \n 27 26  0  0  0  0  0  0  0  0999 V2000\n    5.4641    0.4400    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    3.7321    0.4400    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    9.7942   -0.0600    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    4.5981   -1.0600    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n    6.3301   -0.0600    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.1962    0.4400    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8660   -0.0600    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   10.6603    0.4400    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    2.0000    0.4400    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   11.5263   -0.0600    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    8.0622   -0.0600    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0\n    8.9282    0.4400    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0\n    4.5981   -0.0600    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0\n    6.3301   -0.6800    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n    7.1962    1.0600    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n    2.8660   -0.6800    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n   10.6603    1.0600    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n    2.0000    1.0600    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n    1.4631    0.1300    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n   11.5263   -0.6800    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n   12.0632    0.2500    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n    5.8626    0.9149    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n    5.0656    0.9149    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n    4.1306    0.9149    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n    3.3335    0.9149    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n    9.3957   -0.5349    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n   10.1928   -0.5349    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n  1  5  1  0  0  0  0\n  5  6  2  0  0  0  0\n  4 13  2  0  0  0  0\n  2  7  1  0  0  0  0\n  3  8  1  0  0  0  0\n  6 11  1  0  0  0  0\n  7  9  2  0  0  0  0\n  8 10  2  0  0  0  0\n 11 12  1  0  0  0  0\n  1 13  1  0  0  0  0\n  2 13  1  0  0  0  0\n  3 12  1  0  0  0  0\n  5 14  1  0  0  0  0\n  6 15  1  0  0  0  0\n  7 16  1  0  0  0  0\n  8 17  1  0  0  0  0\n  9 18  1  0  0  0  0\n  9 19  1  0  0  0  0\n 10 20  1  0  0  0  0\n 10 21  1  0  0  0  0\n  1 22  1  0  0  0  0\n  1 23  1  0  0  0  0\n  2 24  1  0  0  0  0\n  2 25  1  0  0  0  0\n  3 26  1  0  0  0  0\n  3 27  1  0  0  0  0\nM  END\n$$$$\n'
      });
}