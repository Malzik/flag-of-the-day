create table draw_flags
(
    game_id bigint unsigned null,
    code    longtext        null,
    step    bigint          null
);

create table flag_hints
(
    code  varchar(100) null,
    title varchar(100) null,
    value longtext     null
);

alter table flag_hints
    add constraint idx_code_key
        unique (code, title);

create table flag_names
(
    code varchar(100) null,
    lang varchar(100) null,
    name longtext     null
);

alter table flag_names
    add constraint idx_code_lang
        unique (code, lang);

create table flags
(
    code  varchar(100) not null,
    image longtext     null
);

alter table flags
    add primary key (code);

alter table flag_hints
    add constraint fk_flags_hints
        foreign key (code) references flags (code)
            on update cascade on delete set null;

alter table flag_names
    add constraint fk_flags_names
        foreign key (code) references flags (code)
            on update cascade on delete set null;

create table games
(
    id   bigint unsigned auto_increment
        primary key,
    date datetime(3) null
);

alter table draw_flags
    add constraint fk_games_flags
        foreign key (game_id) references games (id)
            on update cascade on delete cascade;

alter table games
    add constraint idx_date
        unique (date);

create table player_games
(
    id        bigint unsigned auto_increment
        primary key,
    player_id longtext        null,
    game_id   bigint unsigned null,
    is_win    longtext        null
);

create table player_guesses
(
    player_game_id bigint unsigned              null,
    step           bigint                       null,
    guesses        longtext collate utf8mb4_bin null
);

alter table player_guesses
    add constraint idx_game_step
        unique (player_game_id, step);

alter table player_guesses
    add check (json_valid(`guesses`));

create table players
(
    id     varchar(191) not null,
    streak bigint       null
);

alter table players
    add primary key (id);


