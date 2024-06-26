var express = require('express'),
    router = express.Router(),
    fs = require("fs"),
    multiparty = require('multiparty');

/* GET home page. */
router.get('/upload', function(req, res) {
  res.render('index', { title: 'Загрузка файлов' });
});

router.post('/upload', function(req, res, next) {
    // create a form to begin parsing
    var form = new multiparty.Form();
    var uploadFile = {uploadPath: '', type: '', size: 0};
    var maxSize = 30720; //2MB 10 * 1024 * 1024
    var supportMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    var errors = [];

    form.on('error', function(err){
        if(fs.existsSync(uploadFile.path)) {
            fs.unlinkSync(uploadFile.path);
            console.log('error');
        }
    });

    form.on('close', function() {
        if(errors.length == 0) {
            res.send({status: 'ok', text: 'Success'});
        }
        else {
            if(fs.existsSync(uploadFile.path)) {
                fs.unlinkSync(uploadFile.path);
            }
            res.send({status: 'bad', errors: errors});
        }
    });

    // listen on part event for image file
    form.on('part', function(part) {
        uploadFile.size = part.byteCount;
        uploadFile.type = part.headers['content-type'];
        uploadFile.path = './files/' + part.filename;

        // if(uploadFile.size > maxSize) {
        //     errors.push('File size is ' + uploadFile.size / 1024 / 1024 + '. Limit is' + (maxSize / 1024 / 1024) + 'MB.');
        // }

        if(supportMimeTypes.indexOf(uploadFile.type) == -1) {
            errors.push('Неподдерживаемый mimetype ' + uploadFile.type);
        }

        if(errors.length == 0) {
            var out = fs.createWriteStream(uploadFile.path);
            part.pipe(out);
        }
        else {
            part.resume();
        }
    });

    // parse the form
    form.parse(req);
});

module.exports = router;
