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
        eventSources: [
            {
                url: '/api/calendar',
                data: {
                    order: 'medicine-name'
                }
            },
            {
                url: '/api/calendar',
                data: {
                    order: 'plan'
                },
                color: '#2e856e'
            }
        ],
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
            modal.find('input[name=plan_title]').val('');
            modal.find('input[name=plan_title]').parents('.form-group').find('.form-error').text('');
            modal.find('input[name=plan_date]').val(date.format());
            modal.find('input[name=plan_date]').parents('.form-group').find('.form-error').text('');
            modal.find('textarea[name=plan_description]').val('');
            modal.find('textarea[name=plan_description]').parents('.form-group').find('.form-error').text('');
            modal.find('input[name=plan_notice]').prop('checked', false);
            modal.find('input[name=plan_notice]').parents('.form-group').find('.form-error').text('');
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
                    calendar.fullCalendar('addEventSource', {
                        url: '/api/calendar',
                        data: {
                            order: 'plan'
                        },
                        color: '#2e856e'
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
                    calendar.fullCalendar('addEventSource', {
                        url: '/api/calendar',
                        data: {
                            order: 'plan'
                        },
                        color: '#2e856e'
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
        if (response.status) {
            let calendar = $('#medicine-calendar');
            calendar.fullCalendar('refetchEvents');

            $('#modal-plan-add').modal('hide');
        } else {
            modal.find('input[name=plan_title]').parents('.form-group').find('.form-error').text('');
            modal.find('input[name=plan_date]').parents('.form-group').find('.form-error').text('');
            modal.find('textarea[name=plan_description]').parents('.form-group').find('.form-error').text('');
            modal.find('input[name=plan_notice]').parents('.form-group').find('.form-error').text('');

            switch (response.message) {
                case 'SESSION_ERROR':
                    modal.find('input[name=plan_notice]').parents('.form-group').find('.form-error').text('不明なエラー');
                    break;
                case 'VALIDATION_ERROR':
                    let error = response.error;

                    modal.find('input[name=plan_title]').parents('.form-group').find('.form-error').text(error['plan_title']);
                    modal.find('input[name=plan_date]').parents('.form-group').find('.form-error').text(error['plan_date']);
                    modal.find('textarea[name=plan_description]').parents('.form-group').find('.form-error').text(error['plan_description']);
                    modal.find('input[name=plan_notice]').parents('.form-group').find('.form-error').text(error['plan_notice']);
                    break;
            }
        }
    }).fail(function () {
        modal.find('input[name=plan_notice]').parents('.form-group').find('.form-error').text('通信に失敗しました');
    });
};

const planEdit = () => {

};

const planDelete = () => {

};