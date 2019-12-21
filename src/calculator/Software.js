import React from 'react';
import Paket from './paket/Software';
import BaseCalculator from './BaseCalculator';
import metrics from './BaseMetrics';
import { ListFramework, SliderDatabase, SchemeList,
	SoftwareOps, DurationListing, Submit, Validation } from './BaseWidget';
import { Grid, Row, Col } from '@zendeskgarden/react-grid';

class Software extends BaseCalculator {
	listPaket() { return Paket }
	calculate() {
		this.setState((state) => {
			const { framework, database, quick, security, deploy } = state.pesanan;
			let flist = framework.map(x => metrics.frameworks[x]).reduce((a, b) => {
				return {
					price: a.price + b.price,
					duration: a.duration + b.duration,
				}
			}, {
				price: 0,
				duration: 0,
			});
			let dlist = metrics.database[database];
			let error = '';
			const hasBackend = (framework.includes('ci') || framework.includes('express') || framework.includes('laravel'));
			if (framework.length === 0) {
				error = "Framework kosong";
			}
			else if (!security && deploy) {
				error = "Jika aplikasi benar-benar ingin dijalankan maka audit keamanan harus ada";
			}
			else if (security && database === 'none') {
				error = "Tidak ada pembobolan yang perlu dikhawatirkan jika aplikasi tidak mempunyai database";
			}
			else if (hasBackend && database === 'none') {
				error = "Database tidak bisa kosong apabila memasang backend (CI/Express/Laravel)";
			}
			else if (database !== 'none' && !hasBackend && (framework.includes('static') || framework.includes('pwa')))
			{
				error = 'Web statis/PWA tidak dapat mengakses database tanpa backend (CI/Express/Laravel)';
			}
			else if (database !== 'none' && hasBackend && (framework.includes('static')))
			{
				error = 'Web statis sudah termasuk backend (CI/Express/Laravel)';
			}
			else if (database !== 'none' && security && !hasBackend) {
				error = "Agar database terlindungi minimal ada framework backend (CI/Express/Laravel)";
			}
			return {
				listing: {
					price: [
						flist.price,
						dlist.price,
						quick ? flist.price + dlist.price : 0,
						security ? dlist.price * 2 : 0,
						deploy ? 1000 * 1000 : 0
					].reduce((a, b) => a + b, 0),
					duration: Math.floor((flist.duration + dlist.duration) / (quick ? 3 : 1)),
					revision: [7, 30, 60][(security ? 1 : 0) + (deploy ? 1 : 0)],
				},
				error
			}
		})
	}
	render() {
		const pesanan = this.state.pesanan;
		const listing = this.state.listing;
		return <div style={{ '--scheme': '#035' }} className="calculator-container" >
			<Grid>
				<Row>
					<Col md={6} lg={4}>
						<SchemeList list={this.state.paket} event={this.setSchemeProp} />
					</Col>
					<Col md={6} lg={8}>
						<div className="control-item">
							<SliderDatabase value={pesanan.database} event={this.setPesananProp} name="database" />
							<ListFramework value={pesanan.framework} event={this.setPesananProp} name="framework" />
							<SoftwareOps value={pesanan} event={this.setPesananProp} />
							<DurationListing value={listing} />
							<Validation error={this.state.error}/>
							<Submit uri={this.state.uri} event={this.submitPesanan} disabled={Boolean(this.state.error)}
									price={listing.price} quick={pesanan.quick} title="Aplikasi"/>
						</div>
					</Col>
				</Row>
			</Grid>
		</div>
	}
}

export default Software