function disp() {
    document.getElementById("exampleModal").innerHTML = "" +
        "<div class=\"modal-dialog\" role=\"document\" id=\"div-modal\">\n"+
        "        <div class=\"modal-content\">\n" +
        "            <div class=\"modal-header\">\n" +
        "                <h5 class=\"modal-title\" id=\"exampleModalLabel\">Modal title</h5>\n" +
        "                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n" +
        "                    <span aria-hidden=\"true\">&times;</span>\n" +
        "                </button>\n" +
        "            </div>\n" +
        "            <div class=\"modal-body\" id=\"modal-html\">\n" +
        "               aiueo\n" +
        "            </div>\n" +
        "            <div class=\"modal-footer\">\n" +
        "                <button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">Close</button>\n" +
        "                <button type=\"button\" class=\"btn btn-primary\" onclick=\"disp2()\" id=\"modal-btn\">aiueo</button>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "</div>";
}
function disp2() {
    document.getElementById("exampleModal").innerHTML = "" +
        "<div class=\"modal-dialog\" role=\"document\" id=\"div-modal-div\">\n"+
        "        <div class=\"modal-content\">\n" +
        "            <div class=\"modal-header\">\n" +
        "                <h5 class=\"modal-title\" id=\"exampleModalLabel\">Modal title</h5>\n" +
        "                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n" +
        "                    <span aria-hidden=\"true\">&times;</span>\n" +
        "                </button>\n" +
        "            </div>\n" +
        "            <div class=\"modal-body\" id=\"modal-html\">\n" +
        "               aiueo\n" +
        "            </div>\n" +
        "            <div class=\"modal-footer\">\n" +
        "                <button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">Close</button>\n" +
        "                <button type=\"button\" class=\"btn btn-primary\" onclick=\"disp()\" id=\"modal-btn\">kakikukeko</button>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "</div>";
}