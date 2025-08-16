# Razen Standard Library Specification

⭐ A list of ~50 libraries with good, realistic, sensible coverage.  
⭐ ~400 total functions, grouped and listed in markdown.  
⭐ Clean naming.  
⭐ All functions listed once under their proper scope.  
⭐ Designed to give broad coverage without external downloads.

---

## ✅ All-in-one Standard Library Spec

---

## 📚 1. Array Library (arrlib)

- push
- pop
- shift
- unshift
- slice
- splice
- concat
- join
- index_of
- last_index_of
- includes
- reverse
- sort
- map
- filter
- reduce
- every
- some
- find
- find_index
- fill
- length

---

## 📚 2. String Library (strlib)

- upper
- lower
- capitalize
- substring
- replace
- replace_all
- trim
- trim_start
- trim_end
- starts_with
- ends_with
- includes
- split
- repeat
- pad_start
- pad_end
- char_at
- code_point_at
- from_char_code
- length

---

## 📚 3. Math Library (mathlib)

- add
- subtract
- multiply
- divide
- modulo
- power
- sqrt
- abs
- round
- floor
- ceil
- sin
- cos
- tan
- asin
- acos
- atan
- atan2
- log
- exp
- min
- max
- clamp
- lerp
- random
- random_int
- random_float
- mean
- median
- mode
- variance
- stddev

---

## 📚 4. DateTime Library (datetime)

- now
- parse
- format
- year
- month
- day
- hour
- minute
- second
- millisecond
- weekday
- weekday_name
- is_leap_year
- days_in_month
- add_days
- add_months
- add_years
- add_hours
- add_minutes
- add_seconds
- diff_days
- diff_months
- diff_years
- to_timestamp
- from_timestamp

---

## 📚 5. Random Library (randomlib)

- seed
- int
- float
- choice
- shuffle
- sample
- random
- weighted_choice
- uuid
- gaussian
- noise

---

## 📚 6. Filesystem Library (filesystem)

- exists
- is_file
- is_dir
- create_file
- create_dir
- remove
- read_file
- write_file
- append_file
- list_dir
- copy_file
- copy_dir
- move_file
- delete_file
- delete_dir
- absolute_path
- relative_path
- extension
- file_stem
- parent_dir
- join_path
- current_dir
- change_dir
- temp_file
- temp_dir
- metadata
- read_json
- write_json

---

## 📚 7. JSON Library (json)

- parse
- stringify
- validate
- minify
- pretty_print

---

## 📚 8. Network Library (network)

*(Merged netlib + apilib + extras)*

- get
- post
- put
- delete
- patch
- head
- options
- fetch
- download_file
- upload_file
- ping
- resolve_dns
- get_ip
- url_encode
- url_decode
- build_query
- parse_query
- create_api
- execute_api
- parse_json
- to_json
- is_success
- is_client_error
- is_server_error
- websocket_connect
- websocket_send
- websocket_receive
- websocket_close
- form_data
- multipart_data

---

## 📚 9. System Library (systemlib)

- getpid
- getcwd
- execute
- getenv
- setenv
- environ
- args
- path_exists
- realpath
- exit
- sleep
- hostname
- username
- uptime
- os_type
- os_release
- cpu_count
- memory_info
- disk_usage
- load_average
- reboot
- shutdown
- suspend

---

## 📚 10. Process Library (processlib)

- create
- wait
- is_running
- kill
- signal
- list
- info
- read_stdout
- read_stderr
- write_stdin
- priority
- suspend
- resume

---

## 📚 11. Validation Library (validation)

- email
- phone
- url
- ip
- required
- min_length
- max_length
- between
- regex
- is_numeric
- is_integer
- is_float
- is_boolean
- is_date
- is_json
- is_uuid

---

## 📚 12. Regex Library (regex)

- match
- search
- replace
- split
- findall
- compile
- groups

---

## 📚 13. Crypto Library (crypto)

- hash
- hmac
- encrypt
- decrypt
- generate_key
- sign
- verify
- random_bytes
- pbkdf2
- base64_encode
- base64_decode
- md5
- sha1
- sha256
- sha512

---

## 📚 14. UUID Library (uuid)

- generate
- parse
- validate
- v1
- v4

---

## 📚 15. Color Library (color)

- hex_to_rgb
- rgb_to_hex
- lighten
- darken
- blend
- contrast
- get_ansi_color
- rgba_to_hex
- hex_to_rgba

---

## 📚 16. Image Library (image)

- load
- save
- resize
- crop
- rotate
- flip
- blur
- sharpen
- grayscale
- invert
- draw_text
- draw_shape
- add_watermark

---

## 📚 17. Audio Library (audio)

- load
- play
- pause
- stop
- record
- save
- volume
- balance
- duration
- trim
- fade_in
- fade_out

---

## 📚 18. Video Library (video)

- load
- play
- pause
- stop
- record
- save
- trim
- resize
- add_subtitles
- extract_audio
- screenshot

---

## 📚 19. Compression Library (compresslib)

- zip
- unzip
- gzip
- gunzip
- tar
- untar
- compress
- decompress

---

## 📚 20. Archive Library (archivelib)

- create
- extract
- list
- add_file
- remove_file

---

## 📚 21. Logging Library (loglib)

- info
- warn
- error
- debug
- fatal
- trace
- set_level
- get_level
- add_handler
- remove_handler
- format
- rotate

---

## 📚 22. Config Library (configlib)

- load
- save
- get
- set
- remove
- list
- validate
- merge
- default

---

## 📚 23. Cache Library (cachelib)

- set
- get
- has
- remove
- clear
- keys
- size
- ttl

---

## 📚 24. Database Library (dblib)

- connect
- disconnect
- execute
- query
- fetch_one
- fetch_all
- commit
- rollback
- begin_transaction
- migrate
- seed
- close
- escape
- prepare

---

## 📚 25. HTTP Server Library (httplib)

- start
- stop
- route
- listen
- serve_static
- send_response
- set_header
- get_header
- parse_request
- parse_body
- middleware
- redirect
- status

---

## 📚 26. HTML Utility Library (htmllib)

- parse
- stringify
- escape
- unescape
- select
- query
- add_class
- remove_class
- set_attr
- get_attr
- inner_html
- outer_html

---

## 📚 27. Template Library (templatelib)

- render
- compile
- include
- escape
- loop
- if
- else
- set
- get
- partial

---

## 📚 28. CSV Library (csvlib)

- parse
- stringify
- read
- write
- validate
- headers
- rows
- columns

---

## 📚 29. XML Library (xmllib)

- parse
- stringify
- validate
- get_attr
- set_attr
- find
- find_all

---

## 📚 30. YAML Library (yamllib)

- parse
- stringify
- validate
- merge
- flatten

---

## 📚 31. INI Library (inilib)

- parse
- stringify
- get
- set
- remove
- sections

---

## 📚 32. Notification Library (notifylib)

- send
- schedule
- cancel
- list
- history

---

## 📚 33. Email Library (emaillib)

- send
- receive
- parse
- validate
- attach
- list
- delete

---

## 📚 34. SMS Library (smslib)

- send
- receive
- parse
- validate
- history

---

## 📚 35. WebSocket Library (websocketlib)

- connect
- send
- receive
- close
- broadcast
- on_open
- on_message
- on_close

---

## 📚 36. Event Emitter Library (eventlib)

- on
- off
- once
- emit
- listeners
- remove_all

---

## 📚 37. Queue Library (queuelib)

- enqueue
- dequeue
- peek
- is_empty
- size
- clear
- list

---

## 📚 38. Stack Library (stacklib)

- push
- pop
- peek
- is_empty
- size
- clear
- list

---

## 📚 39. Graph Library (graphlib)

- add_node
- remove_node
- add_edge
- remove_edge
- neighbors
- bfs
- dfs
- shortest_path
- has_cycle

---

## 📚 40. Tree Library (treelib)

- add_node
- remove_node
- find
- traverse
- depth
- height
- is_leaf

---

## 📚 41. Geometry Library (geomlib)

- distance
- midpoint
- area
- perimeter
- volume
- angle
- rotate
- scale
- translate
- intersect
- union
- difference

---

## 📚 42. Seed & Noise Library (seedlib)

- generate
- map_seed
- noise_map
- perlin
- simplex
- name
- pattern

---

## 📚 43. Box Utility Library (boxlib)

- put
- get
- has
- remove
- clear
- is_box
- size

---

## 📚 44. Conversion Library (convertlib)

- to_string
- to_int
- to_float
- to_bool
- to_array
- to_object
- to_json
- to_yaml
- to_csv
- to_xml

---

## 📚 45. Heads/Tails Utility Library (htlib)

- coin
- bool_tos
- flip
- probability

---

## 📚 46. OS Info Library (oslib)

- platform
- architecture
- distro
- kernel
- release
- uptime
- hostname
- user
- cpu_info
- memory_info
- disk_info

---

## 📚 47. Bolt Library (bolt)

- run
- parallel
- threads
- task
- await
- schedule

---

## 📚 48. Animation Library (animlib)

- start
- stop
- pause
- resume
- set_frame
- get_frame
- timeline
- easing
- loop
- reverse

---

## 📚 49. Physics Library (physlib)

- apply_force
- apply_torque
- velocity
- acceleration
- mass
- collision
- gravity
- friction
- momentum
- energy

---

## 📚 50. AI Utility Library (ailib)

- predict
- train
- evaluate
- load_model
- save_model
- preprocess
- tokenize
- embed
- classify
- cluster
- generate_text

---

## Summary

✅ **Total Libraries:** ~50  
✅ **Total Functions:** 400+

---

*This comprehensive standard library specification provides broad coverage for the Razen programming language without requiring external downloads.*
