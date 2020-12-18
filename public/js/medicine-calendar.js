$(() => {
    $('#medicine-calendar').fullCalendar({
        height: window.innerHeight - 160,
        locale: 'ja',
        header: {
            left: 'prev,today,next',
            center: 'title',
            right: 'buttonMedicineName,buttonHospitalName'
        },
        events: '/api/calendar',
        eventColor: '#4285F4',
        eventTextColor: '#fff',
        eventRender: (event, el) => {
            $(el).popover({
                title: event.title,
                content: event.description,
                trigger: 'hover',
                placement: 'top',
                container: 'body',
                html: true
            });
        },
        customButtons: {
            buttonMedicineName: {
                text: '薬名表示',
                click: () => {
                    let calendar = $('#medicine-calendar');
                    calendar.fullCalendar('removeEventSources');
                    calendar.fullCalendar('addEventSource', {
                        url: '/api/calendar',
                        data: {
                            order: 'medicine-name'
                        }
                    });
                    calendar.fullCalendar('refetchEvents');
                }
            },
            buttonHospitalName: {
                text: '病院名表示',
                click: () => {
                    let calendar = $('#medicine-calendar');
                    calendar.fullCalendar('removeEventSources');
                    calendar.fullCalendar('addEventSource', {
                        url: '/api/calendar',
                        data: {
                            order: 'hospital-name'
                        }
                    });
                    calendar.fullCalendar('refetchEvents');
                }
            }
        }
    });
})
