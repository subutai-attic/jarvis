self.on('message', function onMessage(annotations) {
    $('<style type="text/css">.highlight { background-color: #FFFF88; }</style>').appendTo($('head'));
    $("body").unhighlight();
    for (var key in annotations) {
        if (annotations.hasOwnProperty(key)) {
            let annotation = annotations[key];
            if (annotation.url == document.location.toString()) {
                $("body").highlight(annotation.anchorText);
                createAnchor(annotation);
            }
        }
    }
    let annotated = $('.highlight');

    annotated.bind('mouseenter', function (event) {
        self.port.emit('show',                     
            [
                this['baseURI'],
                $(this).attr('annotation'),
                this['textContent'],
                $(this).attr('issueKey')
            ]
        );
        event.stopPropagation();
        event.preventDefault();
    });

    // annotated.bind('mouseleave', function () {
    //     self.port.emit('hide');
    // });
});

function createAnchor(annotation) {
    console.log ( "annotation : ", annotation );
    annotationAnchorAncestor = $('#' + annotation.ancestorId);
    annotationAnchor = $(annotationAnchorAncestor).parent().find(
        ':contains(' + annotation.anchorText + ')').last();
    $(annotationAnchor).addClass('annotated');
    $(annotationAnchor).attr('annotation', annotation.comment);
    $(annotationAnchor).attr('issueKey', annotation.jiraKey);
} 