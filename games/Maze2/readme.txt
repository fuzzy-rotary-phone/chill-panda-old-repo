 In browser console run 
 localStorage.setItem('displayMazeSettings', true);
 
 for images use unicodes
 https://unicode-table.com/en/emoji/#link-travel-and-places
 
 replace unicode in mazing.css
#maze div div.door.exit::after {
  content: "\1F6AA";
}
#maze div div.nubbin::after {
  content: "\1F33C";
}
#maze div.nubbin:nth-of-type(3n)::after {
  content: "\1F344";
}
#maze div.nubbin:nth-of-type(5n)::after {
  content: "\1F33B";
}
#maze div.nubbin:nth-of-type(7n)::after {
  content: "\1F48E";
}
#maze div.nubbin:nth-of-type(13n)::after {
  content: "\1F381";
}
#maze div.hero::after {
  content: "\26F5" !important;
}