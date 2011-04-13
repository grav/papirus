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
//includeScript("jquery-1.5.2.js");

function showOnly(elm){
    $(elm).show();
    $(elm).siblings().hide();
    if (elm!=null && elm!=undefined) showOnly(elm.parentElement);
}

function show(elm){
    try{
        $(elm).show();

    } catch(e){
        console.log(e)
    }
    if (elm!=null) show(elm.parentElement);
}

//$("body").hide();

//show($("#page-content")[0]);

//if (window.location.href.match(/^http\:\/\/www\.information\.dk\/\d+/)){
//    information();
//}
//
//
//
//
//
//
//function information(){
//    $(document.body).hide()
//
//
//
//
//    $("#page-content").show();
//
//}
