$(() => {
    let body = $('body');

    let templateModalPlanAdd = Handlebars.compile($('#modal-plan-add-layout').html());
    body.append(templateModalPlanAdd({}));
    let templateModalPlanEdit = Handlebars.compile($('#modal-plan-edit-layout').html());
    body.append(templateModalPlanEdit({}));

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
        dayClick: date => {
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
        eventClick: event => {
            if (event.type === 'plan') {
                let modal = $('#modal-plan-edit');
                modal.find('input[name=plan_id]').val(event.plan_id);
                modal.find('input[name=plan_title]').val(event.title);
                modal.find('input[name=plan_title]').parents('.form-group').find('.form-error').text('');
                modal.find('input[name=plan_date]').val(event.start.format());
                modal.find('input[name=plan_date]').parents('.form-group').find('.form-error').text('');
                modal.find('textarea[name=plan_description]').val(event.description);
                modal.find('textarea[name=plan_description]').parents('.form-group').find('.form-error').text('');
                modal.find('input[name=plan_notice]').prop('checked', event.plan_notice);
                modal.find('input[name=plan_notice]').parents('.form-group').find('.form-error').text('');
                modal.modal('show');
            }
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
    }).done(response => {
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
    }).fail(() => {
        modal.find('input[name=plan_notice]').parents('.form-group').find('.form-error').text('通信に失敗しました');
    });
};

const planEdit = () => {
    let modal = $('#modal-plan-edit');
    let planId = modal.find('input[name=plan_id]').val();
    let planTitle = modal.find('input[name=plan_title]').val();
    let planDate = modal.find('input[name=plan_date]').val();
    let planDescription = modal.find('textarea[name=plan_description]').val();
    let planNotice = modal.find('input[name=plan_notice]').prop('checked');

    const notyf = new Notyf({
        position: {
            y: 'top',
        },
    });

    $.ajax({
        url: '/api/calendar-plan/edit',
        type: 'POST',
        data: {
            plan_id: planId,
            plan_title: planTitle,
            plan_date: planDate,
            plan_description: planDescription,
            plan_notice: planNotice
        }
    }).done(response => {
        if (response.status) {
            let calendar = $('#medicine-calendar');
            calendar.fullCalendar('refetchEvents');

            modal.modal('hide');
            notyf.success('予定を編集しました');
        } else {
            modal.find('input[name=plan_title]').parents('.form-group').find('.form-error').text('');
            modal.find('input[name=plan_date]').parents('.form-group').find('.form-error').text('');
            modal.find('textarea[name=plan_description]').parents('.form-group').find('.form-error').text('');
            modal.find('input[name=plan_notice]').parents('.form-group').find('.form-error').text('');

            switch (response.message) {
                case 'SESSION_ERROR':
                    modal.find('input[name=plan_notice]').parents('.form-group').find('.form-error').text('不明なエラー');
                    break;
                case 'DATA_NOTFOUND':
                    modal.find('input[name=plan_notice]').parents('.form-group').find('.form-error').text('データが見つかりませんでした');
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
    }).fail(() => {
        modal.find('input[name=plan_notice]').parents('.form-group').find('.form-error').text('通信に失敗しました');
    });
};

const planDelete = () => {
    let modal = $('#modal-plan-edit');
    let planId = modal.find('input[name=plan_id]').val();

    const notyf = new Notyf({
        position: {
            y: 'top',
        },
    });

    swal({
        title: '予定削除',
        text: '予定を削除しますか？',
        icon: 'warning',
        buttons: ['キャンセル', '削除'],
        dangerMode: true
    }).then(function (value) {
        if (value) {
            modal.modal('hide');

            $.ajax({
                url: '/api/calendar-plan/delete',
                type: 'POST',
                data: {
                    plan_id: planId
                }
            }).done(function (response) {
                if (response.status) {
                    let calendar = $('#medicine-calendar');
                    calendar.fullCalendar('refetchEvents');

                    notyf.success('予定を削除しました');
                } else {
                    notyf.error('エラーが発生しました');
                }
            }).fail(function () {
                notyf.error('通信に失敗しました');
            });
        }
    });
};