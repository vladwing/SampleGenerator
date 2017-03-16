module.exports = {
    'app': {
        'name': 'Alert Checker',
    },
    'definitions': [
        {
            'greenMin': 0,
            'greenMax': 20,
            'name': 'Temperatura',
            'endpoint': null,
            'meta': {
                'id': 2,
            }
        },
        {
            'greenMin': 0,
            'greenMax': 100,
            'name': 'Temperatura Critica',
            'endpoint': null,
            'meta': {
                'id': 1,
            }
        }
    ],
    'fieldMapper' : {
        'tableName': 'adc_param_measure',
        'equal': {
            'idParam': 'sample.meta.id',
        },
        'timestampField': 'MeasureTime',
        'valueField': 'MeasureDouble',
    },
    'db': {
        'host': 'db',
        'port': 3306,
        'user': 'telegreen',
        'password': 'password',
        'database': 'telegreen_db',
    },
    'jobInterval': 15000,
};
