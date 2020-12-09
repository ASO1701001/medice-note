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
        dayClick: function(date) {
            console.log(date.format());

            $('#modal-plan-add-button').click();
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

    $('#modal-plan-add-button').fireModal({
        title: '予定追加',
        body: $("#modal-plan-add-layout"),
        footerClass: 'bg-whitesmoke',
        autoFocus: false,
        center: true,
        appended: function (modal, form) {
            $('.datetimepicker').daterangepicker({
                locale: {
                    format: 'YYYY-MM-DD hh:mm',
                    applyLabel: "設定",
                    cancelLabel: "キャンセル",
                    daysOfWeek: ["日", "月", "火", "水", "木", "金", "土"],
                    monthNames: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
                },
                singleDatePicker: true,
                timePicker: true,
                timePicker24Hour: true,
                timePickerIncrement: 30,
                autoApply: true
            });
            // let data = form[0];
            // let showItem = JSON.parse(localStorage.getItem('show_item'));
            //
            // data.checkboxHospitalName.checked = showItem['hospitalName'];
            // data.checkboxNumber.checked = showItem['number'];
            // data.checkboxTakeTime.checked = showItem['takeTime'];
            // data.checkboxDate.checked = showItem['date'];
            // data.checkboxTypeName.checked = showItem['typeName'];
            // data.checkboxGroup.checked = showItem['group'];
            // data.checkboxDescription.checked = showItem['description'];
        },
        onFormSubmit: function (modal, e, form) {
            // let data = $(e.target);
            // data = data[0];
            //
            // let hospitalName = data.checkboxHospitalName.checked;
            // let number = data.checkboxNumber.checked;
            // let takeTime = data.checkboxTakeTime.checked;
            // let date = data.checkboxDate.checked;
            // let typeName = data.checkboxTypeName.checked;
            // let group = data.checkboxGroup.checked;
            // let description = data.checkboxDescription.checked;
            //
            // let array = {
            //     'hospitalName': hospitalName,
            //     'number': number,
            //     'takeTime': takeTime,
            //     'date': date,
            //     'typeName': typeName,
            //     'group': group,
            //     'description': description
            // }
            // localStorage.setItem('show_item', JSON.stringify(array));
            // toggleShowItem(array);
            //
            // form.stopProgress();
            //
            // e.preventDefault();
            // $.destroyModal(modal);
            //
            // notyf.success('表示設定を変更しました');
        },
        buttons: [
            {
                text: '閉じる',
                class: 'btn btn-secondary',
                handler: function (modal) {
                    $.destroyModal(modal);
                }
            },
            {
                text: '追加',
                submit: true,
                class: 'btn btn-primary btn-shadow',
                handler: function (modal) {
                }
            }
        ]
    });
})
