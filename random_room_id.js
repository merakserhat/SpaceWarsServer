var chars = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","R","S","T","U","V","Y","Z","X","W","Q","1","2","3","4","5","6","7","8","9","0"];

exports.getRandomId = function () {
	var id = "";
	for(var i=0;i<6;i++){
		id += chars[Math.floor(Math.random() * chars.length)]
	}
	
	return id;
};

