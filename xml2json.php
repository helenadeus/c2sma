<?php
	$url = $_GET['url'];$name = $_GET['name'];$domid = $_GET['domid'];  $type = $_REQUEST['service'];$id = $_GET['id']; 
	$cacheFile = 'cache/'.md5($url);
	$headers = get_headers($url, 1);
	//echo '<pre>';print_r($_REQUEST);echo '</pre>';EXIT;
	//echo '<pre>';print_r($headers);echo '</pre>';exit;
	if($headers[0]=="HTTP/1.1 200 OK"){
		//what type of data is this 
		if($headers['Content-Type']=='text/xml; charset=utf-8'){
			//save the xml
			if(!is_file($cacheFile)){
				
				$a = fopen($url, "r"); $b = stream_get_contents($a);
				$c = new SimpleXMLElement($b);
				
				switch($type) {
					case 'SimpleSearch':
						if($c->int!=''){
							
							$chemSpiderID = $c->int;
							echo json_encode(array('true', $name, $domid, $chemSpiderID));
							exit;
						}


						break;
					case 'GetCompoundInfo':
						//assuming here that csid is correct
						echo json_encode(array('true', $name, $id, $domid, array('InChI'=>$c->InChI, 'InChIKey'=>$c->InChIKey, 'SMILES'=>$c->SMILES)));
						exit;
						break;
					case 'GetCompoundThumbnail':
						//download an image	
						$decodedImg = base64_decode($c[0]); 
						file_put_contents($cacheFile.".png", $decodedImg);
						echo json_encode(array('true', $name, $id, $domid, $cacheFile.".png"));
						exit;
						break;
				
				}
				
			}
			else {
				echo 'b';
			}
		}
		else {
			echo 'c';
		}
		
		
	}
	
	echo json_encode(array('false', $name, $domid));
	


?>