module.exports = {
    'app': {
        'port': 8000,
        'name': 'Sample Generator',
    },
    'definitions': [
        {
            'greenMin': 0,
            'greenMax': 20,
            'redMin': 20,
            'redMax': 100,
            'name': 'Temperatura',
            'meta': { 'id': 2, 'avg': 0},
        },
        {
            'greenMin': 0,
            'greenMax': 100,
            'redMin': 100,
            'redMax': 200,
            'name': 'Temperatura Critica',
            'meta': { 'id': 1, 'avg': 0},
        }
    ],
    'outputDriver': {
        'tableName': 'adc_param_measure',
        'fieldMapper': {
            'MeasureDouble': 'sample.value',
            'MeasureTime': 'sample.dateTimeMysql',
            'MeasureAvg': 'sample.meta.avg',
            'IDParam': 'sample.meta.id',
        },
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
