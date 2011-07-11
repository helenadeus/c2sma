<?php
	$url = $_GET['url'];$name = $_GET['name']; $type = $_REQUEST['output'];
	$headers = get_headers($url, 1);
	echo '<pre>';print_r($headers);echo '</pre>';exit;
	if($headers[0]=="HTTP/1.1 200 OK" && $headers['ETag']!=''){
		//what type of data is this 
		
		if($headers['Content-Type']=='text/plain; charset=UTF-8'){
			
			
			//what type
			switch($type) {
				case 'chemspider_id':
					//return the data as regular string
					$a = file_get_contents($url);
					
					echo json_encode(array('true', $name, $a));
					exit;
				break;
			
			}
			
			if(!file_exists("sdf/".$name.".sdf")){
				$a = file_get_contents($url);
				$b = file_put_contents("sdf/".$name.".sdf", $a);
			}
			else {
				$a = file_get_contents("sdf/".$name.".sdf");
			}
			echo json_encode(array('true', $name, $a));//return the name of the file
			exit;
		}
	}

	
	echo json_encode(array('false', $name));
	
	

?>