// The MIT License (MIT)

// hal.js | Copyright (c) 2019 IGN

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// documentation on HAL API: https://api.archives-ouvertes.fr/docs/search/?schema=fields#fields

var halApi = function(halId){
  const fl = 'fileAnnexesFigure_s,invitedCommunication_s,proceedings_s,popularLevel_s,halId_s,authIdHalFullName_fs,producedDateY_i,docType_s,files_s,fileMain_s,fileMainAnnex_s,linkExtUrl_s,title_s,en_title_s,fr_title_s,label_bibtex,citationRef_s';
  return "https://api.archives-ouvertes.fr/search/?q=authIdHal_s:%22"+halId+"%22&wt=json&sort=producedDateY_i desc&rows=10000&fl="+fl;
}

var getPublications = function(halId, parent, params){
  if (!parent) return;

  // Create a request variable and assign a new XMLHttpRequest object to it.
  var request = new XMLHttpRequest();

  // Open a new connection, using the GET request on the URL endpoint
  var url = halApi(halId)+params;
  // console.log(url);
  request.open('GET', url, true);
  request.onload = function () {
    var docs = JSON.parse(this.response).response.docs;
    // console.log(docs);
    if(docs.length == 0) {
      parent.hidden = true;
    } else {
      const ol = document.createElement('ol');
      ol.setAttribute("class","sub");
      docs.forEach(doc => createPub(doc, ol));
      parent.appendChild(ol);
    }
  };
  request.send();
}

const publication_options = {
  pubPV:  "&fq=popularLevel_s:1",
  pubASCL:"&fq=popularLevel_s:0&fq=docType_s:\"ART\"&fq=peerReviewing_s:0",
  pubACL: "&fq=popularLevel_s:0&fq=docType_s:\"ART\"&fq=peerReviewing_s:1&fq=audience_s:2",
  pubACLN:"&fq=popularLevel_s:0&fq=docType_s:\"ART\"&fq=peerReviewing_s:1&fq=audience_s:(NOT 2)",
  pubINV: "&fq=popularLevel_s:0&fq=docType_s:\"COMM\"&fq=invitedCommunication_s:1",
  pubCOM: "&fq=popularLevel_s:0&fq=docType_s:\"COMM\"&fq=invitedCommunication_s:0&fq=proceedings_s:0",
  pubACTI:"&fq=popularLevel_s:0&fq=docType_s:\"COMM\"&fq=invitedCommunication_s:0&fq=proceedings_s:1&fq=audience_s:2",
  pubACTN:"&fq=popularLevel_s:0&fq=docType_s:\"COMM\"&fq=invitedCommunication_s:0&fq=proceedings_s:1&fq=audience_s:(NOT 2)",
  pubOS:  "&fq=popularLevel_s:0&fq=docType_s:\"COUV\"",
  pubDO:  "&fq=popularLevel_s:0&fq=docType_s:\"DOUV\"",
  pubAP:  "&fq=popularLevel_s:0&fq=docType_s:(\"REPORT\" OR \"UNDEFINED\")",
  pubTH:  "&fq=popularLevel_s:0&fq=docType_s:(\"THESE\" OR \"HDR\")",
  pubAFF: "&fq=popularLevel_s:0&fq=docType_s:\"POSTER\""
}

// based on http://production-scientifique.bnf.fr/Annexe/cadre-de-classement
function classement(doc) 
{
  if (doc.popularLevel_s == 1) return 'PV';
  if (doc.docType_s == 'COUV') return 'OS';
  if (doc.docType_s == 'DOUV') return 'DO';
  if (doc.docType_s == 'POSTER') return 'AFF';
  if (doc.docType_s == 'THESE' || doc.docType_s == 'HDR') return 'TH';
  if (doc.docType_s == 'REPORT' || doc.docType_s == 'UNDEFINED') return 'AP';
  if (doc.docType_s == 'COMM')
  {
    console.log(doc);
    if (doc.invitedCommunication_s == 1) return 'INV';
    if (doc.proceedings_s == 0) return 'COM';
    if (doc.audience_s == 2) return 'ACTI';
    return 'ACTN';
  }
  if (doc.docType_s == 'ART')
  {
    if (doc.peerReviewing_s == 0) return 'ASCL';
    if (doc.audience_s == 2) return 'ACL';
    return 'ACLN';
  }
  return '???';
}

var getPublicationsAuthor = function(halId, options = publication_options)
{
  for (var id in options)
    getPublications(halId, document.getElementById(id), options[id]);
}

var getKeywordPublicationsAuthor = function(halId, keyword, parent){
  parent = document.getElementById(parent || "pub") || parent;
  getPublications(halId, parent, "&fq=keyword_s:\""+keyword+"\"");
}

var getKeywordPublicationsAuthorYear = function(halId, keyword, year, parent){
  parent = document.getElementById(parent || "pub") || parent;
  getPublications(halId, parent, "&fq=keyword_s:\""+keyword+"\"&fq=producedDateY_i:"+year);
}

var getKeywordPublicationsAuthorStartYear = function(halId, keyword, startYear, parent, endYear){
  parent = document.getElementById(parent || "pub") || parent;
console.log(parent);
  endYear = endYear || new Date().getFullYear();
  for(year=endYear;year >= startYear;year--)
  {
	var divElement = document.createElement('div');
	divElement.innerHTML = year;
	const yearParentElement = parent.appendChild(divElement);
        getKeywordPublicationsAuthorYear(halId, keyword, year, yearParentElement);
  }
}

function parseCitation(doc, citationElement, linksElement)
{
  var regex = /. <a[^>]*href="(https?:\/\/([^"\/]*)\/[^"]*)"[^>]*>&#x27E8;([^<]*)&#x27E9;<\/a>/;
  var citation = doc.citationRef_s;
  while((matches = regex.exec(citation)) !== null) {
    const url = matches[1];
    var host = matches[2];
    const text = matches[3];
    citation = citation.replace(matches[0],'');
    var icons = {
      'dx.doi.org': 'doi.svg',
      'www.mdpi.com': 'mdpi.jpg'
    }
    const img = "img/icons/"+(icons[host] || "link.svg")

    const aElement = document.createElement('a');
    aElement.setAttribute("href",url);
    aElement.setAttribute("class","imgLink");
    imgElement = document.createElement('img');
    imgElement.setAttribute("title",text);
    imgElement.setAttribute("src", img);
    imgElement.setAttribute("height","20");
    imgElement.setAttribute("alt",text);
    aElement.appendChild(imgElement);
    linksElement.appendChild(aElement);
  }
  citationElement.innerHTML = citation;
}

var clickBibtex = function(label_bibtex){
  const input = document.createElement("input");
  document.body.appendChild(input);
  input.value = label_bibtex;
  input.select();
  document.execCommand("copy"); 
  document.body.removeChild(input);
  alert("This bibtex entry should be copied to the clipboard:\n"+label_bibtex);
}

function createBibtex(label_bibtex, parent)
{
  // create a span element inside the new div
  const spanElement = document.createElement('span');
  spanElement.setAttribute("class","bibtex");
  // create an input element inside the span
  const inputElement = document.createElement('input');
  inputElement.setAttribute("type","image");
  inputElement.setAttribute("class","imgLink");
  inputElement.setAttribute("src","img/icons/bibtex.jpg");
  inputElement.setAttribute("alt","Copy BibTeX to clipboard");
  inputElement.setAttribute("title","Copy BibTeX to clipboard");
  inputElement.onclick = function() {clickBibtex(label_bibtex);}
  spanElement.appendChild(inputElement);
  return spanElement;
}

var createPub = function(doc, parent){
  // console.log(doc);
  if (!parent) return;
  const listElement = document.createElement('li');
  listElement.setAttribute("class", "bib");
  listElement.setAttribute("id", doc.halId_s);
  const linksElement = document.createElement('span');
  // listElement.innerHTML = '<b>'+classement(doc)+'</b>';

  const authors = document.createElement('span');
  for(var i = 0; i < doc.authIdHalFullName_fs.length; ++i)
  {
    const [_idHal, _fullName] = doc.authIdHalFullName_fs[i].split('_FacetSep_');
    const author = document.createElement(_idHal ? 'a' : 'span');
    if(_idHal) author.setAttribute("href",'https://cv.archives-ouvertes.fr/'+_idHal);
    author.setAttribute("id",_idHal);
    author.setAttribute("class","author");
    const span = document.createElement('span');
    span.innerHTML = _fullName;
    author.appendChild(span);
    authors.appendChild(author);
  }
  listElement.appendChild(authors);

  const title = document.createElement('a');
  
  title.setAttribute("href",'https://hal.archives-ouvertes.fr/'+doc.halId_s);
  title.setAttribute("class","title");
  if (doc.en_title_s && doc.fr_title_s) {
    const title_en = document.createElement('span');
    const title_fr = document.createElement('span');
    title_en.setAttribute("class","lang-en");
    title_fr.setAttribute("class","lang-fr");
    title_en.innerHTML = doc.en_title_s;
    title_fr.innerHTML = doc.fr_title_s;
    title.appendChild(title_en);
    title.appendChild(title_fr);
  } else {
    title.innerHTML = (doc.en_title_s || doc.fr_title_s || doc.title_s);
  }
  listElement.appendChild(title);

  const ref = document.createElement('span');
  parseCitation(doc, ref, linksElement);
  listElement.appendChild(ref);

  // create an a element with the url of the pdf
  const file = doc.linkExtUrl_s || doc.fileMain_s || doc.fileMainAnnex_s;
  const files = doc.files_s || (file ? [file] : []);
  for(var i = 0; i < files.length; ++i)
  {
    const file = files[i];
    pdfElement = document.createElement('a');
    pdfElement.setAttribute("href",file);
    pdfElement.setAttribute("class","imgLink");
    imgPdfElement = document.createElement('img');
    imgPdfElement.setAttribute("title","pdf");
    imgPdfElement.setAttribute("src","img/icons/pdf_icon.gif");
    imgPdfElement.setAttribute("height","20");
    imgPdfElement.setAttribute("alt","pdf");
    pdfElement.appendChild(imgPdfElement);
    linksElement.appendChild(pdfElement);
  }
  linksElement.insertBefore(createBibtex(doc.label_bibtex), linksElement.firstChild);
  listElement.insertBefore(linksElement, listElement.firstChild);
  parent.appendChild(listElement);
  jQuery('lang-en').hide();
}

