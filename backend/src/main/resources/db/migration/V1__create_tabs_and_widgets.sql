-- Create user_tabs table
CREATE TABLE user_tabs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_tabs_user_id ON user_tabs(user_id);

-- Create data_sources table
CREATE TABLE data_sources (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    payload JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create widgets table
CREATE TABLE widgets (
    id BIGSERIAL PRIMARY KEY,
    tab_id BIGINT NOT NULL,
    data_source_id BIGINT,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(150),
    grid_position JSONB NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_widgets_tab FOREIGN KEY (tab_id)
        REFERENCES user_tabs(id) ON DELETE CASCADE,
    CONSTRAINT fk_widgets_data_source FOREIGN KEY (data_source_id)
        REFERENCES data_sources(id) ON DELETE SET NULL
);

CREATE INDEX idx_widgets_tab_id ON widgets(tab_id);
CREATE INDEX idx_widgets_data_source_id ON widgets(data_source_id);
