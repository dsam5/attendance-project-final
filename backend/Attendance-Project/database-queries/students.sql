use attendance_project;
show tables;

select * from student;
-- manipulate student records directly

insert into student values (8889023,215995,'Godfred','Owusu', 3, 'CS3'); --
insert into student values (8889024,215996,'Abdul-Jawad','Iddrissu', 3, 'CS3'); --

insert into student values (8889025,225992,'John','Doe', 2, 'CS2');
insert into student values (8889026,225993,'Walden','Schmidt', 2, 'CS2');
insert into student values (8889027,225994,'Alan','Harper', 2, 'CS2');
insert into student values (8889028,225995,'Charlie','Buckets', 2, 'CS2');
insert into student values (8889029,225996,'Akosua','Mensah', 2, 'CS2');

insert into student values (8889125,235992,'David','Mawuli', 1, 'CS1');
insert into student values (8889126,235993,'Sam','David', 1, 'CS1');
insert into student values (8889127,235994,'Prince','Nyarko', 1, 'CS1');
insert into student values (8889128,235995,'Benjamin','Kumah', 1, 'CS1');
insert into student values (8889129,235996,'Rose','Ansah', 1, 'CS1');

-- delete from student where student_exam_number in (8889127,8889128,8889129);
