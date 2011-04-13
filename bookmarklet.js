/**
 * Created by IntelliJ IDEA.
 * User: grav
 * Date: 13/04/11
 * Time: 15.21
 * To change this template use File | Settings | File Templates.
 */
(function() {
    window.baseUrl = 'http://meshell.local:8000';
    window.readabilityToken = '';
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('charset', 'UTF-8');
    s.setAttribute('src', baseUrl + '/papirus.js');
    document.documentElement.appendChild(s);
})();

