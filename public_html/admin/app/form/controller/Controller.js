Ext.define('App.form.controller.Controller', {
    extend    : 'Ext.app.ViewController',
    name      : null,
    store     : null,
    container : null,

    initForm : function(name, store) {
        this.name  = name;
        this.store = store;
    },

    getName : function() {
        return this.name;
    },

    getStore : function() {
        return this.store;
    },

    setContainer : function(container) {
        this.container = container;
    },

    getContainer : function() {
        return this.container;
    },

    removeContainer : function() {
        this.getView().remove(this.getContainer());
        this.setContainer(null);
    },

    onMainGridSelect : function() {
        this.getView().lookupReference('mainGridDeleteButton').enable();
    },

    onMainGridDeselect : function(grid) {
        var deleteButton = this.getView().lookupReference('mainGridDeleteButton');

        if (!grid.getSelection().length) {
            deleteButton.disable();
        }
    },

    onMainGridDblClick : function(grid, record) {
        this.setContainer(this.getView().add({
            xtype        : this.getName(),
            formStore    : this.getStore(),
            createRecord : false,

            bind: {
                title : 'Edit Record: {record.title}'
            },

            viewModel : {
                data : {
                    record : record
                }
            }
        }).show());
    },

    onChildGridBeforeRender : function(grid) {
        var store      = grid.getStore(),
            filters    = grid.filters,
            container  = this.getContainer();

        if (Ext.isArray(filters) && !Ext.isEmpty(filters)) {
            Ext.Array.each(filters, function(filter) {
                store.filter(filter.property, container.getViewModel().data.record.get(filter.value));
            });
        }
    },

    onCreateClick : function() {
        this.setContainer(this.getView().add({
            xtype : this.getName(),
            title : 'New Record',

            viewModel : {
                data : {
                    record : []
                }
            }
        }).show());
    },

    onSyncAndCloseClick : function() {
        if (this.onSyncClick()) {
            this.onCancelClick();
        }
    },

    onSyncClick : function() {
        var formContainer = this.getContainer(),
            form          = formContainer.down('form'),
            store         = formContainer.lookupViewModel(true).getStore(this.getStore()),
            values        = form.getValues(),
            success       = false;

        if (form.isValid()) {
            if (formContainer.createRecord) {
                store.add(values);
            }

            store.sync({
                'failure' : function() {
                    store.rejectChanges();
                },
                'success' : function() {
                    if (formContainer.createRecord) {
                        store.reload();
                    }
                }
            });

            return true;
        }

        return false;
    },

    onDeleteClick : function() {
        Ext.Msg.confirm('Delete', 'Are you sure?', 'onDeleteConfirm', this);
    },

    onDeleteConfirm : function(choice) {
        if (choice === 'yes') {
            var grid          = this.getView().down('mainGrid'),
                store         = grid.lookupViewModel(true).getStore(this.getStore()),
                selection     = grid.getSelection();

            if (selection.length > 0) {
                store.remove(selection);

                store.sync({
                    'failure' : function() {
                        store.rejectChanges();
                    }
                });
            }
        }
    },

    onCancelClick : function() {
        this.removeContainer();
    }

});
