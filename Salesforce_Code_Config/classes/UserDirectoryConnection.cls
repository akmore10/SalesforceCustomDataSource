global class UserDirectoryConnection extends DataSource.Connection {

    private DataSource.ConnectionParams connectionInfo;

    global UserDirectoryConnection(DataSource.ConnectionParams connectionInfo) {
        this.connectionInfo = connectionInfo;
    }

    // ---- SYNC: Define the schema for the External Object ----
    override global List<DataSource.Table> sync() {
        List<DataSource.Table> tables = new List<DataSource.Table>();
        List<DataSource.Column> columns = new List<DataSource.Column>();

        // MANDATORY columns (must be exactly these names)
        columns.add(DataSource.Column.text('ExternalId', 255));
        columns.add(DataSource.Column.url('DisplayUrl'));
        columns.add(DataSource.Column.text('Name', 255));

        // Custom columns matching your API fields
        columns.add(DataSource.Column.text('Email', 255));
        columns.add(DataSource.Column.text('Role', 255));
        columns.add(DataSource.Column.text('Department', 255));
        columns.add(DataSource.Column.text('Status', 255));
        columns.add(DataSource.Column.url('Avatar_URL'));
        columns.add(DataSource.Column.text('Phone', 255));
        columns.add(DataSource.Column.text('Bio', 1000));
        columns.add(DataSource.Column.text('Created_At', 255));

        // 'UserTable' = API name of External Object, 'Name' = label field
        tables.add(DataSource.Table.get('UserTable', 'Name', columns));
        return tables;
    }

    // ---- QUERY: Fetch data from your API ----
    override global DataSource.TableResult query(DataSource.QueryContext context) {
        List<Map<String, Object>> rows = new List<Map<String, Object>>();

        // Handle single-record lookup (e.g., from a detail page)
        String externalId = null;
        if (context.tableSelection != null && context.tableSelection.filter != null) {
            DataSource.Filter filter = context.tableSelection.filter;
            if (filter.type == DataSource.FilterType.EQUALS &&
                filter.columnName == 'ExternalId') {
                externalId = String.valueOf(filter.columnValue);
            }
        }

        // Build the callout
        HttpRequest req = new HttpRequest();
        req.setMethod('GET');
        req.setHeader('Accept', 'application/json');

        if (externalId != null) {
            // Your API doesn't have /api/users/{id}, so fetch all and filter in Apex
            req.setEndpoint('callout:UserDirectoryAPI/api/users');
        } else {
            req.setEndpoint('callout:UserDirectoryAPI/api/users');
        }

        try {
            Http http = new Http();
            HttpResponse res = http.send(req);
			system.debug('ON line [63]:'+  res);
            if (res.getStatusCode() == 200) {
                // Parse the wrapper: { success, count, data: [...] }
                Map<String, Object> parsed = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                List<Object> dataList = (List<Object>) parsed.get('data');

                if (dataList != null) {
                    for (Object obj : dataList) {
                        Map<String, Object> item = (Map<String, Object>) obj;

                        // If a single record was requested, skip non-matching rows
                        if (externalId != null && String.valueOf(item.get('id')) != externalId) {
                            continue;
                        }

                        Map<String, Object> row = new Map<String, Object>();
                        row.put('ExternalId', String.valueOf(item.get('id')));
                        row.put('DisplayUrl', 'https://annotated-reasons-package-lisa.trycloudflare.com/api/users?id=' + item.get('id'));
                        row.put('Name', item.get('name'));
                        row.put('Email', item.get('email'));
                        row.put('Role', item.get('role'));
                        row.put('Department', item.get('department'));
                        row.put('Status', item.get('status'));
                        row.put('Avatar_URL', item.get('avatar'));
                        row.put('Phone', item.get('phone'));
                        row.put('Bio', item.get('bio'));
                        row.put('Created_At', item.get('created_at'));
                        rows.add(row);
                    }
                }
            } else {
                System.debug('API error: ' + res.getStatus() + ' - ' + res.getBody());
            }
        } catch (Exception e) {
            System.debug('Callout failed: ' + e.getMessage());
        }

        return DataSource.TableResult.get(context, rows);
    }
}