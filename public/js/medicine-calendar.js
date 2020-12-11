$(() => {
    let template = Handlebars.compile($('#modal-plan-add-layout').html());
    $('body').append(template({}));

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
        dayClick: function (date) {
            let modal = $('#modal-plan-add');
            let planTitle = modal.find('input[name=plan_title]').val('');
            let planDescription = modal.find('textarea[name=plan_description]').val('');
            let planNotice = modal.find('input[name=plan_notice]').prop('checked', false);
            modal.modal('show');
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

const planAdd = () => {
    let modal = $('#modal-plan-add');
    let planTitle = modal.find('input[name=plan_title]').val();
    let planDate = modal.find('input[name=plan_date]').val();
    let planDescription = modal.find('textarea[name=plan_description]').val();
    let planNotice = modal.find('input[name=plan_notice]').prop('checked');

    $.ajax({
        url: '/api/calendar-plan/add',
        type: 'POST',
        data: {
            plan_title: planTitle,
            plan_date: planDate,
            plan_description: planDescription,
            plan_notice: planNotice
        }
    }).done(function (response) {

    }).fail(function () {

    }).always(function () {

    });
};

const planEdit = () => {

};

const planDelete = () => {

};