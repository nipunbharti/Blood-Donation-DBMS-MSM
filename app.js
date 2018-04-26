var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var mysql = require('mysql');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine","ejs");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: 'blood',
  multipleStatements: true
});

var queryResult;

a();

function a(){
	con.connect(function(err) {
	  if (err) throw err;
	  console.log("Connected!");
	  con.query("select * from DONOR_DETAIL", function(err, result, fields){
	  	if(err){
	  		throw err;
	  	}
	  	else{
	  		queryResult = result;
	  	}
	  	b(result);
	  });
	  con.query("select * from PATIENT_DETAILS", function(err, result, fields){
	  	if(err){
	  		throw err;
	  	}
	  	else{
	  		c(result);
	  	}
	  });
	  con.query("select * from BANK_DETAILS", function(err, result, fields){
	  	if(err){
	  		throw err;
	  	}
	  	else{
	  		d(result);
	  	}
	  });
	  con.query("select * from PATIENT_DETAILS; select * from BANK_DETAILS", function(err, result){
	  	if(err) throw err;
	  });
	});
}

function b(result){
	app.get("/donordetails", function(req,res){
		res.render("donorDetails", {result: result});
	})
}

function c(result){
	app.get("/patientdetails", function(req,res){
		res.render("patientDetails", {result: result});
	})
}

function d(result){
	app.get("/bankdetails", function(req,res){
		res.render("bankDetails", {result: result});
	})
}

app.get("/",function(req,res){
	res.render("home");
});

app.post("/adddonor", function(req, res){
	var statement = "insert into DONOR_DETAIL values ('" + req.body.newdonorName + "'," + req.body.newdonorAge + ",'" + req.body.newdonorSex + "','" + req.body.newdonorBlood + "','" + req.body.newdonorCId + "'," + req.body.newdonorAmount + ");";
	console.log(statement);
	con.query(statement, function(err, result, fields){
		if(err) throw err;
	});
	var statement2 = "update BANK_DETAILS set Amount = (select sum(Amount) from DONOR_DETAIL where Blood_Group = '" + req.body.newdonorBlood + "') where Blood_Group = '" + req.body.newdonorBlood +"'";
	console.log(statement2);
	con.query(statement2, function(err, result, fields){
		if(err) throw err;
		console.log(result);
	})
	res.redirect("/");
})

app.post("/addpatient", function(req, res){
	var statement = "insert into DONOR_DETAIL values ('" + req.body.newpatientName + "'," + req.body.newpatientAge + ",'" + req.body.newpatientSex + "','" + req.body.newpatientBlood + "'," + req.body.newpatientAmount + ",'" + req.body.newpatientPId + "');";
	console.log(statement);
	con.query(statement, function(err, result, fields){
		if(err) throw err;
		console.log(result);
	});
	var statement2 = "update BANK_DETAILS set Amount =((select sum(Amount) from BANK_DETAILS where Blood_Group = '" + req.body.newpatientBlood + "')" + "- (select sum(Amount_taken) from PATIENT_DETAILS where Blood_Group = '" + req.body.newdonorBlood + "')) where Blood_Group = '" + req.body.newdonorBlood +"'";
	res.redirect("/");
})

app.listen(3000, function(){
	console.log("3000");
});