const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/images/');
    },
    filename: function(req, file, cb){
        cb(null, /*new Date().toDateString() + '_' + */file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    //accept
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ){
        cb(null, true)
    }else{
        cb(null, false)
    }
}

const upload = multer( {storage: storage,
    /*
    limits: {
        fileSize: 2048 * 2048 * 5
    },*/
    fileFilter: fileFilter
    
});
const Item = require('../models/itemModel');
var excel = require('excel4node');
var pdfDoc = require('pdfkit');
var fs = require('fs');
const nodemailer = require('nodemailer');
var math = require('mathjs');


router.get('/', function(req, res, next) {
    res.render('newItem', { title: 'Add New Item' });
    console.log("entered '/' item route");
  });

//Save a single item
router.post('/newitem', upload.single('productImage'), (req, res, next) => {

    console.log(req.file);

    const item = new Item({
        _id: new mongoose.Types.ObjectId(),
        Name: req.body.Name,
        Room: req.body.Room,
        Price: req.body.Price,
        ModelNum: req.body.ModelNum,
        SerialNum: req.body.SerialNum,
        Purchase_Location: req.body.Purchase_Location,
        //Receipt_URL: req.body.Receipt_URL,
        Product_URL: "images/" + req.file.originalname,//filePath,//req.file.path,
        UserID: globalUserID
    });

    item.save().then(result => {
        console.log(result);
        res.render('success-message', {title: "Item Added", message: "Item Added Successfully!"});
        
    }).catch(err => {
        console.log(err);
    });


});

//Delete a single item by itemId
router.get('/delete/:itemId', (req, res, next) => {
    Item.remove({ _id: req.params.itemId })
        .exec()
        .then(result => {
            //res.render('success-message', {title: "Item Deleted", message: "Item Deleted Successfully!"});
            res.redirect("/item/inventory");
            /*
            res.status(200).json({
                message: "Item Deleted Successfully!"
            });
            */
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                err: err
            });
        });
});

//Get all items associated with the User's ID by UserID
router.get('/inventory', (req, res, next) => {
    var id = globalUserID;
    console.log("item get /userID/" + id)
    Item.find({ UserID: id })
        .exec()
        .then(docs => {
            console.log("document info from the DB", docs);
            if (docs) {
                /*
                res.status(200).json({
                    Items: docs
                });
                */
                res.render('inventory', {title: 'Inventory List', items: docs});
            } else {
                res.render('message', {title: "No Items", message: "No items found associated with that User ID."});
                /*
                res.status(404).json({
                    message: "No items found associated with that User ID."
                });
                */
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
});

router.get('/add-recipients', function(req, res, next) {
    res.render('recipients', { title: 'Add Email Address(es)' });
  });

// Share the user's inventory
// Create a PDF Inventory Report
// Create an Excel Spreadsheet Report
// Attach and send the reports in an email
router.get('/share', (req, res, next) => {
    Item.find({ UserID: globalUserID}).exec().then(docs => {
        console.log("Document Information for Excel file creation.", docs);
        if (docs) {
            
            
            var fontSz = 16;
            var receiptImgW = 150;
            var itemImgW = 150;
            //Create a PDF version of the inventory also?

            var pdf = new pdfDoc; //pdfkit
            pdf.pipe(fs.createWriteStream('Inventory.pdf'));

            var pdfDocCounter = 0;

            //# Embed a font, set the font size, and render some text
            // Add data to the sheet
            for (var row = 2; row <= docs.length + 1; row++) {
                pdf.fontSize(fontSz).text(docs[pdfDocCounter].Name);
                pdf.fontSize(fontSz).text(docs[pdfDocCounter].Room);
                pdf.fontSize(fontSz).text("$" + docs[pdfDocCounter].Price);
                pdf.fontSize(fontSz).text(docs[pdfDocCounter].ModelNum);
                pdf.fontSize(fontSz).text(docs[pdfDocCounter].SerialNum);
                pdf.fontSize(fontSz).text(docs[pdfDocCounter].Purchase_Location);
                //pdf.image(docs[pdfDocCounter].Receipt_URL, { width: receiptImgW});
                //console.log('PDF Creation - Image URL: .\\'+ docs[pdfDocCounter].Product_URL);
                //pdf.image(docs[pdfDocCounter].Product_URL, { width: itemImgW });               
                pdf.fontSize(10).text("----------------------------------------------------------------------------------------------------------------------------------------");
                pdf.fontSize(10).text(" ");
                pdfDocCounter++;

                if (math.mod(pdfDocCounter, 4) == 0) {
                    pdf.addPage();
                }
             
            }

            //# Finalize PDF file
            pdf.end()

            ////////////////////////////////////////////////////////////////


              // Start the Excel file creation here  
              var workbook = new excel.Workbook();

              // Add Worksheets to the workbook
              var worksheet = workbook.addWorksheet('Sheet 1');
              
              // Create a reusable style
              var headerStyle = workbook.createStyle({
                  font: {
                    color: '#FF0800',
                      size: 18
                  }
              });

              var style = workbook.createStyle({
                font: {
                  color: 'black',
                  size: 12
                },
                numberFormat: '$#,##0.00; ($#,##0.00); -'
              });
            
              // Create Cell Headers

             

            worksheet.cell(1, 1).string('Name').style(headerStyle);
            worksheet.cell(1, 2).string('Room').style(headerStyle);
            worksheet.cell(1,3).string('Price').style(headerStyle);
            worksheet.cell(1,4).string('Model Number').style(headerStyle);
            worksheet.cell(1,5).string('Serial Number').style(headerStyle);
            worksheet.cell(1,6).string('Purchase Location').style(headerStyle);
            //worksheet.cell(1,7).string('Receipt Image URL').style(headerStyle);
            //worksheet.cell(1,8).string('Product Image URL').style(headerStyle);


              var docCounter = 0;

              // Add data to the sheet
              for(var row = 2; row <= docs.length + 1; row++){

         
                  worksheet.cell(row, 1).string(docs[docCounter].Name).style(style);
                  worksheet.cell(row, 2).string(docs[docCounter].Room).style(style);
                  worksheet.cell(row, 3).number(docs[docCounter].Price).style(style);
                  worksheet.cell(row, 4).string(docs[docCounter].ModelNum).style(style);
                  worksheet.cell(row, 5).string(docs[docCounter].SerialNum).style(style);
                  worksheet.cell(row, 6).string(docs[docCounter].Purchase_Location).style(style);
                  //worksheet.cell(row, 7).string(docs[docCounter].Receipt_URL).style(style);
                  //worksheet.cell(row, 8).string(docs[docCounter].Product_URL).style(style);
                  docCounter++;

              }
              
              // Adjust all cell widths
              for(var col = 1; col < 8; col++){
                worksheet.column(col).setWidth(25);
              }

              // Save the workbook
            workbook.write('Inventory.xlsx');


            

            nodemailer.createTestAccount((err, account) => {
                // create reusable transporter object using the default SMTP transport
                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'scsu.project.email@gmail.com',
                        pass: 'Root123!@#'
                    }
                });
               
                var emails = req.query.emails;
                console.log("Email(s): " + emails);

                // setup email data with unicode symbols
                let mailOptions = {
                    from: '"Daniel Tillmann" <scsu.project.email@gmail.com>', // sender address

                    to: emails, //drtillmann@stcloudstate.edu, anas.abdulahi3@gmail.com', // list of receivers

                    subject: globalName + '\'s Inventory List', // Subject line
                    attachments: [
                        { path: '\Inventory.pdf' },
                        { path: '\Inventory.xlsx' }
                    ],
                    text: 'Hello world', // plain text body
                    html: '<b>' + globalName + '\'s Inventory List</b>' // html body
                };

                // send mail with defined transport object
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: %s', info.messageId);
                    // Preview only available when sending through an Ethereal account
                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                });
            });

        }else{
            res.status(404).json({Send_Inventory_Message: "No Items Found Associated with that User ID."});
        }

        res.render('success-message', {title: "Email Sent", message: "Email Sent Successfully!"});

    }).catch(err => {
        console.log({"Send Inventory Error": err});
        res.status(500).json({
            "Send Inventory Error": err
        });
    });
});








// Update an item by the itemId

router.post('/:itemId', (req, res, next) => {


    Item.remove({ _id: req.params.itemId })
    .exec()
    .then(result => {
        //res.render('success-message', {title: "Item Deleted", message: "Item Deleted Successfully!"});
        //res.redirect("/item/inventory");
        /*
        res.status(200).json({
            message: "Item Deleted Successfully!"
        });
        */
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            err: err
        });
    });


    var pathToChange = req.body.url;
    var filePath = pathToChange.substring(1);

    const item = new Item({
        _id: new mongoose.Types.ObjectId(),
        Name: req.body.Name,
        Room: req.body.Room,
        Price: req.body.Price,
        ModelNum: req.body.ModelNum,
        SerialNum: req.body.SerialNum,
        Purchase_Location: req.body.Purchase_Location,
        //Receipt_URL: req.body.Receipt_URL,
        Product_URL: filePath,//filePath,//req.file.path,
        UserID: globalUserID
    });

    item.save().then(result => {
        //res.render('success-message', {title: "Item Added", message: "Item Added Successfully!"});
        res.redirect("/item/inventory");
    }).catch(err => {
        console.log(err);
    });


});










/*
router.post('/:itemId', (req, res, next) => {
    const id = req.params.itemId;
    const updateOps = {};

    for (var ops in req.body) {
        updateOps[ops.propName] = ops.value;
    }

    Item.update({ _id: id }, { $set: updateOps }
    )  .exec()
        .then(result => {
            console.log(result);
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});
*/

module.exports = router;
