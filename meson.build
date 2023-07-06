


project(
    'liquipedia scripts',
    'cpp',
    license: 'MIT',
    default_options: [
        'buildtype=release',
        'optimization=3',
        'cpp_std=c++20',
        'strip=true',
        'b_ndebug=if-release',
        'warning_level=3',
        'werror=true',
    ],
    version: '1.0.1',

)

cpp = meson.get_compiler('cpp')
if cpp.get_id() == 'msvc'
    add_project_arguments('/std:c++latest', language: 'cpp')
elif cpp.get_id() == 'gcc'
    add_project_arguments('-std=c++23', '-Wold-style-cast', language: 'cpp')
elif cpp.get_id() == 'clang'
    add_project_arguments('-std=c++2b', language: 'cpp')
else
    add_project_arguments('-std=c++20', language: 'cpp')
endif


add_project_arguments(
    cpp.get_supported_arguments(
        '-Wconversion',
        '-Wcast-align',
        '-Wunused',
        '-Wshadow',
        '-Wpointer-arith',
        '-Wrestrict',
        '-Wcast-qual',
        '-Wno-missing-braces',
        '-Wsign-conversion',
        checked: 'warn',
    ),
    language: 'cpp',
)


inc_dirs = []
src_files = []

subdir('src/cpp')

deps = []

deps += dependency('OpenMP', required: true)


deps += dependency(
    'argparse',
    required: true,
)
executable(
    'combinatorics',
    src_files,
    include_directories: inc_dirs,
    dependencies: deps,
    cpp_args: '-DPROGRAMM_VERSION="@0@"'.format(meson.project_version()),
)

