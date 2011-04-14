/**
 * Created by IntelliJ IDEA.
 * User: grav
 * Date: 13/04/11
 * Time: 15.22
 * To change this template use File | Settings | File Templates.
 */

function includeScript(scriptName) {
    window.baseUrl = 'http://meshell.local:8000';
    window.readabilityToken = '';
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('charset', 'UTF-8');
    s.setAttribute('src', baseUrl + '/'+scriptName);
    document.documentElement.appendChild(s);
}

// TODO: include only if not already included
// or include as something else, so that we have newest version
includeScript("jquery-1.5.2.js");

function showOnly(elm){
    jqPap(elm).show();
    jqPap(elm).siblings().hide();
    if (elm!=null && elm!=undefined) showOnly(elm.parentElement);
}

function show(elm){
        if(elm!=null){
            console.log("elm: "+elm.id+"\n");
            jqPap(elm).show();
            if (elm.parentElement!=undefined){
                show(elm.parentElement);
            }
        }
}

function hideAll(){
    jqPap("*").hide();
}


function show(elm){
    jqPap(elm).parentsUntil().show();
    jqPap(elm).show();
    jqPap(elm+" *").show();
}

function scale(sel,scale){
    console.log("scaling " + sel + " to "+scale);
    jqPap(sel).width(jqPap(sel).width()*scale);
    jqPap(sel).height(jqPap(sel).height()*scale);
}

var jqPap;
function inf(){

    jqPap = jQuery.noConflict();

    hideAll();

    show(".title");
    show(".col.col-five");
    var width;
    if(jqPap(".article-body").length>0){
        // image may be wider than .article-body
        width = jqPap(".article-body").width();
    } else {
        // telegrams do not .have article-body
        width = jqPap("#telegram-wrapper").width();
    }
    jqPap(".webteaser").width(width);
    jqPap(".col.col-five").width(width);

    var imgDiv = ".image-box-large"
    if(jqPap(imgDiv).length>0){
        // Do some image scaling
        var oldCaptionHeight = jqPap(".caption").height();
        var scale = jqPap(".article-body").width() / jqPap(imgDiv).width();
        scale(imgDiv,scale);
        scale(imgDiv+" img",scale);

        // move text further down
        var offset = jqPap(".col.col-three").offset();
        // seems that we need some extra space. And height difference is not enough?
        var extraHeight = 10;
        offset.top += jqPap(".caption").height() - oldCaptionHeight + extraHeight;
        jqPap(".col.col-three").offset(offset);
    }
    jqPap("#page").width(width);
    // we make <body> smaller since everything is centered in it
    var margin = 10; //preserve some margin
    jqPap("body").width(width+2*margin);
}


// delay execution to allow loading of jquery
setTimeout(inf,500);
