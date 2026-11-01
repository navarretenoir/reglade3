Name:           regla-de-3
Version:        1.0
Release:        1%{?dist}
Summary:        Regla de tres fácil, con el paso a paso, para todos
License:        GPL-3.0-or-later
URL:            https://github.com/navarretenoir/regla3
Source0:        https://github.com/navarretenoir/regla3/archive/refs/tags/v%{version}.tar.gz#/%{name}-%{version}.tar.gz
BuildRequires:  gcc make pkgconfig(gtk4) pkgconfig(webkitgtk-6.0)
BuildRequires:  desktop-file-utils
BuildRequires:  libappstream-glib

%description
Direct, inverse and compound rule of three, percentages, discounts and 19% VAT, explained step by step in
plain words. No internet, no accounts. Interface in Spanish.

%prep
%autosetup -n regla3-%{version}

%build
make -C desktop UI_DIR=%{_datadir}/regla-de-3/ui EXTRA_CFLAGS="%{optflags} %{build_ldflags}"

%install
D=%{buildroot}
install -Dm755 desktop/regla-de-3 "%{buildroot}%{_prefix}/bin/regla-de-3"
install -d "%{buildroot}%{_prefix}/share/regla-de-3"; cp -r ui "%{buildroot}%{_prefix}/share/regla-de-3/"; rm -f "%{buildroot}%{_prefix}/share/regla-de-3/ui/"*.bak*
install -Dm644 linux/io.github.navarretenoir.ReglaDe3.desktop "%{buildroot}%{_prefix}/share/applications/io.github.navarretenoir.ReglaDe3.desktop"
install -Dm644 linux/io.github.navarretenoir.ReglaDe3.metainfo.xml "%{buildroot}%{_prefix}/share/metainfo/io.github.navarretenoir.ReglaDe3.metainfo.xml"
install -Dm644 linux/io.github.navarretenoir.ReglaDe3.svg "%{buildroot}%{_prefix}/share/icons/hicolor/scalable/apps/io.github.navarretenoir.ReglaDe3.svg"

%check
desktop-file-validate %{buildroot}%{_datadir}/applications/io.github.navarretenoir.ReglaDe3.desktop
appstream-util validate-relax --nonet %{buildroot}%{_datadir}/metainfo/io.github.navarretenoir.ReglaDe3.metainfo.xml || :

%files
%license LICENSE
%doc README.md
%{_bindir}/*
%{_datadir}/regla-de-3
%{_datadir}/applications/io.github.navarretenoir.ReglaDe3.desktop
%{_datadir}/metainfo/io.github.navarretenoir.ReglaDe3.metainfo.xml
%{_datadir}/icons/hicolor/scalable/apps/io.github.navarretenoir.ReglaDe3.svg


%changelog
* Sun Nov 01 2026 Javiera Navarrete <navarrete.noir@gmail.com> - 1.0-1
- Paquete inicial desde el código fuente.
