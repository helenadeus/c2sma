<?php
	$url = $_GET['url'];$name = $_GET['name']; 
	$headers = get_headers($url, 1);
	
	if($headers[0]=="HTTP/1.1 200 OK"){
		//what type of data is this 
		
		if($headers['Content-Type']=='image/gif'){
			if(!file_exists("images2d/".$name.".gif")){
				$a = file_get_contents($url);
				$b = file_put_contents("images2d/".$name.".gif", $a);
			}
			echo json_encode(array('true', $name));//return the name of the file
			exit;
		}
	}
	
	echo json_encode(array('false', $name));
	
	

?>