const pdfjsLib = require('pdfjs-dist');
const path = require('path');


pdfjsLib.PDFWorker = path.resolve(__dirname, '../../dist/pdf.worker.bundle.js')

export class DocumentPreviewController{

    constructor(file){
        
        this._file = file;
    }

    getPreviewData(){

        return new Promise((suc, fail)=>{

            let reader = new FileReader();

            switch(this._file.type){

                case 'image/png':
                case 'image/jpeg':
                case 'image/jpg':
                case 'image/gif':
                reader.onload = e => {
                    suc({
                        src: reader.result,
                        info: this._file.name
                    });
                }
                reader.onerror = e =>{
                    fail(e);
                }
                reader.readAsDataURL(this._file);
                break;

                case 'application/pdf':

                    reader.onload = e => {

                        pdfjsLib.getDocument(new Uint8Array(reader.result) ).promise.then(pdf => {

                            pdf.getPage(1).then(page => {

                                let viewport = page.getViewport(1);

                                console.log('page', page);

                                let canvas = document.createElement('canvas');
                                let canvasContext = canvas.getContext('2d');

                                canvas.width = viewport.width;
                                canvas.height = viewport.height;

                                page.render({
                                    canvasContext,
                                    viewport
                                }).then(()=>{

                                    let _s = (pdf.numPages > 1) ? 'suc' : '';

                                    suc({
                                        src: canvas.toDataURL('image/png'),
                                        info: `${pdf.numPages} página${_s}`
                                    });

                                }).catch(err =>{
                                    fail(err);
                                });


                            }).cath(err=>{
                                fail(err);
                            });

                        }).catch(err=>{

                            fail(err);
                        });

                    }
                    reader.readAsArrayBuffer(this._file);

                break;

                default:

                    fail();
            }
        })

    }
}