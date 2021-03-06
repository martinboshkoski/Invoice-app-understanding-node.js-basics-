const fs = require('fs');
const path = require('path');

const express = require('express')
const uuid = require('uuid');
const app = express()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.use(express.urlencoded({extended:false}))
app.use(express.static('public'));

app.get('/', function(req, res){
    const filePath = path.join(__dirname, 'data', 'invoices.json');
    const fileData = fs.readFileSync(filePath);
    const existingInvoices = JSON.parse(fileData);
    const invoiceNumber = existingInvoices.length;

    res.render('index', {numberOfInvoices: invoiceNumber})
})

app.post('/stored-invoices', function(req, res){
    const filePath = path.join(__dirname, 'data', 'invoices.json');
    const fileData = fs.readFileSync(filePath);
    const existingInvoices = JSON.parse(fileData);
    // const invoiceNumber = existingInvoices.length + 1;

    const storedInvoice = req.body;
    storedInvoice.id = uuid.v4()

    const invoiceNumber = existingInvoices.length + 1 + '/2022'
    storedInvoice.number = invoiceNumber;
    existingInvoices.push(storedInvoice)
    fs.writeFileSync(filePath, JSON.stringify(existingInvoices))

    //make a sum of the amounts
    const invoiceAmount = parseInt(storedInvoice.invoiceAmount);

    const filePathAmounts = path.join(__dirname, 'data', 'amounts.json');
    const fileDataAmounts = fs.readFileSync(filePathAmounts);
    const existingInvoicesAmounts = JSON.parse(fileDataAmounts);

    existingInvoicesAmounts.push(invoiceAmount)
    fs.writeFileSync(filePathAmounts, JSON.stringify(existingInvoicesAmounts))

    res.redirect('/')
})

app.get('/invoices', function(req, res) {
    const filePath = path.join(__dirname, 'data', 'invoices.json');
    const fileData = fs.readFileSync(filePath);
    const existingInvoices = JSON.parse(fileData);

//Calculating the total amount of the invoices

const filePathAmounts = path.join(__dirname, 'data', 'amounts.json');
const fileDataAmounts = fs.readFileSync(filePathAmounts);
const existingInvoicesAmounts = JSON.parse(fileDataAmounts);
    let invoiceSum = 0;
    for (let i = 0; i < existingInvoicesAmounts.length; i++) {
        invoiceSum += existingInvoicesAmounts[i];
}

    res.render('invoices', {invoices:existingInvoices, invoiceSum:invoiceSum})
})

app.get('/invoices/:id', function(req, res){
    const invoiceId = req.params.id;

    const filePath = path.join(__dirname, 'data', 'invoices.json');
    const fileData = fs.readFileSync(filePath);
    const existingInvoices = JSON.parse(fileData);

    for (const invoice of existingInvoices) {
        if (invoice.id === invoiceId) {
            return res.render('invoice detail', {invoice: invoice})
        }
    }
})

// to delete an invoice from the list (NOT WORKING NOW): 
app.post('/delete-invoice', function(req, res){
    const filePath = path.join(__dirname, 'data', 'invoices.json');
    const fileData = fs.readFileSync(filePath);
    const existingInvoices = JSON.parse(fileData);

    const filePathAmounts = path.join(__dirname, 'data', 'amounts.json');
    const fileDataAmounts = fs.readFileSync(filePathAmounts);
    const existingInvoicesAmounts = JSON.parse(fileDataAmounts);

    existingInvoices.pop()
    existingInvoicesAmounts.pop()

    fs.writeFileSync(filePath, JSON.stringify(existingInvoices))
    fs.writeFileSync(filePathAmounts, JSON.stringify(existingInvoicesAmounts))

    res.redirect('/invoices')
})

app.get('/contact', function(req, res){
    res.render('contact');
})

//Amending the invoices
//Page to amend the invoices, providing the forms
app.get('/invoice_amend/:id', function(req, res){
    const invoiceId = req.params.id;
    const filePath = path.join(__dirname, 'data', 'invoices.json');
    const fileData = fs.readFileSync(filePath);
    const existingInvoices = JSON.parse(fileData);

    for (const invoice of existingInvoices) {
        if (invoice.id === invoiceId) {
            return res.render('invoice_amend', {invoice: invoice})
        }
    }
})

app.post('/invoice_amend/amendInvoice', function(req, res){
    //Getting the inputs and the concrete amended invoice ID
    const invoicePayee = req.body.invoicePayee;
    const invoicePayeeAddress = req.body.invoicePayeeAddress;
    const invoiceDate = req.body.invoiceDate;
    const invoiceItem = req.body.invoiceItem;
    const invoiceAmount = req.body.invoiceAmount;
    const theAmendedInvoiceId = req.body.invoiceId;
    console.log(invoicePayee, invoicePayeeAddress, invoiceDate, invoiceItem, invoiceAmount, theAmendedInvoiceId)

    //getting the invoices array
    const filePath = path.join(__dirname, 'data', 'invoices.json');
    const fileData = fs.readFileSync(filePath);
    const existingInvoices = JSON.parse(fileData);

    //identifying which invoice from the array, has identical ID with the ID of the invoice that the user wants to change 
    for (const invoice of existingInvoices) {
        if (invoice.id === theAmendedInvoiceId) {
            invoice.invoicePayee = invoicePayee;
            invoice.invoicePayeeAddress = invoicePayeeAddress;
            invoice.invoiceDate = invoiceDate;
            invoice.invoiceItem = invoiceItem;
            invoice.invoiceAmount = invoiceAmount;
        fs.writeFileSync(filePath, JSON.stringify(existingInvoices))
    return res.redirect('/invoices')
        }
    }
    //Reducing the amount from the amounts.json

    // const filePathAmounts = path.join(__dirname, 'data', 'amounts.json');
    // const fileDataAmounts = fs.readFileSync(filePathAmounts);
    // const existingInvoicesAmounts = JSON.parse(fileDataAmounts);

    // for (amount of existingInvoicesAmounts) {
    //     if (amount === amountBefore){
    //         console.log('identified amount')
    //     }
    // }
    // fs.writeFileSync(filePathAmounts, JSON.stringify(existingInvoicesAmounts))
})
app.listen(3000)
