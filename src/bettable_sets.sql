create table bettable_sets (
    id serial primary key,
    set_id int not null,
    entrant1Id int not null,
    entrant2Id int not null,
    winnerId int,
    loserId int,

);