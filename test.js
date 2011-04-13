/**
 * Created by IntelliJ IDEA.
 * User: grav
 * Date: 13/04/11
 * Time: 14.52
 * To change this template use File | Settings | File Templates.
 */
function foo() {
    window.baseUrl = 'https://www.readability.com/bookmarklet/read.js';
    window.readabilityToken = '';
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('charset', 'UTF-8');
    s.setAttribute('src', baseUrl + '/bookmarklet/read.js');
    document.documentElement.appendChild(s);
}