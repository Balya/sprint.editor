sprint_editor.registerBlock('medialib_elements', function ($, $el, data) {

    data = $.extend({
        collection_id: 0,
        element_ids: []
    }, data);

    var navparams = {
        page_left: 1,
        page_right: 1,
        page_num: 1
    };

    if (data.page_num && data.page_num >= 1){
        navparams.page_num = data.page_num;
    }

    var hideSource = 1;

    this.getData = function () {
        return data;
    };

    this.collectData = function () {
        data.collection_id = findCollectionId();
        data.element_ids = findElementIds();
        data.page_num = navparams.page_num;
        return data;
    };

    this.afterRender = function () {
        $el.on('click','.j-toogle', function(){
            if (hideSource == 1){
                $el.find('.j-col-source').show();
                hideSource = 0
            } else {
                $el.find('.j-col-source').hide();
                hideSource = 1;
            }
        });

        $el.on('change', '.j-select-collection', function () {
            sendrequest({
                collection_id: findCollectionId(),
                element_ids: findElementIds(),
                page: 1
            });
        });

        $el.on('click', '.j-nav-left', function () {
            sendrequest({
                collection_id: findCollectionId(),
                element_ids: findElementIds(),
                page: navparams.page_left
            });
        });

        $el.on('click', '.j-nav-right', function () {
            sendrequest({
                collection_id: findCollectionId(),
                element_ids: findElementIds(),
                page: navparams.page_right
            });
        });

        sendrequest({
            collection_id: data.collection_id,
            element_ids: data.element_ids,
            page:navparams.page_num
        });

    };

    var findCollectionId = function () {
        return intval(
            $el.find('.j-select-collection').val()
        );
    };

    var findElementIds = function () {
        var $obj = $el.find('.j-elements');

        var values = [];
        $obj.find('.j-medialib-item').each(function () {
            var val = intval(
                $(this).data('id')
            );
            if (val > 0) {
                values.push(val);
            }
        });
        return values;
    };

    var intval = function(val){
        val = (val) ? val : 0;
        val = parseInt(val,10);
        return isNaN(val) ? 0 : val;
    };

    var sendrequest = function (requestParams) {
        var $jresult = $el.find('.j-medialib-result');

        $.ajax({
            url: sprint_editor.getBlockWebPath('medialib_elements') + '/ajax.php',
            type: 'post',
            data: requestParams,
            dataType: 'json',
            success: function (result) {
                result.hideSource = hideSource;
                
                result.page_num = intval(result.page_num);
                result.page_cnt = intval(result.page_cnt);

                navparams.page_num = result.page_num;
                if (result.page_num - 1 > 1) {
                    navparams.page_left = result.page_num - 1;
                } else {
                    navparams.page_left = 1;
                }
                if (result.page_num + 1 > result.page_cnt) {
                    navparams.page_right = result.page_cnt;
                } else {
                    navparams.page_right = result.page_num + 1;
                }

                $jresult.html(
                    sprint_editor.renderTemplate('medialib_elements-select', result)
                );

                var $elem = $jresult.find('.j-elements');
                var $sour = $jresult.find('.j-source');

                var removeIntent = false;
                $elem.sortable({
                    items: ".j-medialib-item",
                    over: function () {
                        removeIntent = false;
                    },
                    out: function () {
                        removeIntent = true;
                    },
                    beforeStop: function (event, ui) {
                        if(removeIntent == true){
                            ui.item.remove();
                        } else {
                            ui.item.removeAttr('style');
                        }

                    },
                    receive: function (event, ui) {
                        var uiIndex = ui.item.attr('data-id');
                        var item =  $(this).find('[data-id=' + uiIndex + ']');
                        if (item.length > 1) {
                            item.last().remove();
                        }
                    }
                });

                $sour.find('.j-medialib-item').draggable({
                    connectToSortable: $elem,
                    helper: "clone",
                    revert: "invalid"
                  });
            },
            error: function () {

            }
        });
    };

});