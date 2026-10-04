global class UserDirectoryProvider extends DataSource.Provider {

    override global List<DataSource.AuthenticationCapability> getAuthenticationCapabilities() {
        List<DataSource.AuthenticationCapability> caps = new List<DataSource.AuthenticationCapability>();
        caps.add(DataSource.AuthenticationCapability.ANONYMOUS);
        return caps;
    }

    override global List<DataSource.Capability> getCapabilities() {
        List<DataSource.Capability> caps = new List<DataSource.Capability>();
        caps.add(DataSource.Capability.ROW_QUERY);
        return caps;
    }

    override global DataSource.Connection getConnection(DataSource.ConnectionParams connectionParams) {
        return new UserDirectoryConnection(connectionParams);
    }
}