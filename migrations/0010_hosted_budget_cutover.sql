-- Local spending frozen before this carryover was captured. Amounts are microdollars.
insert into dts_bot_carryover(id,day,month,spent,held) values(1,'2026-09-21','2026-09',4183,200000);
update dts_bot_budget set enabled=true where id=1;
