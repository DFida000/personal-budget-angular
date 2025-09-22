import { Component, OnDestroy } from '@angular/core';
import { ArticleComponent } from '../article/article.component';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';
import Chart from 'chart.js/auto';
import * as d3 from 'd3';
import { DataService, BudgetData } from '../data/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pb-homepage',
  standalone: true,
  imports: [ArticleComponent, BreadcrumbsComponent],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnDestroy {
  private sub?: Subscription;
  private pieChart?: Chart;

  constructor(private data: DataService) {}

  ngOnInit(): void {
    this.data.load(); // will skip backend if already cached

    this.sub = this.data.data$.subscribe((d) => {
      if (!d || !d.labels.length) return;
      this.renderChartJsPie(d);
      this.renderD3Donut(d);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.pieChart?.destroy();
  }

  // ---- Chart.js pie ----
  private renderChartJsPie(d: BudgetData) {
    const canvas = document.getElementById(
      'myChart',
    ) as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.pieChart?.destroy();
    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: d.labels,
        datasets: [{ data: d.values, backgroundColor: d.colors }],
      },
      options: { responsive: true },
    });
  }

  // ---- D3 donut ----
  private renderD3Donut(d: BudgetData) {
    const host = document.getElementById('d3-donut');
    if (!host) return;
    d3.select(host).selectAll('*').remove();

    const width = host.clientWidth || 420;
    const height = Math.max(260, Math.round(width * 0.6));
    const radius = Math.min(width, height) / 2;

    const svg = d3
      .select(host)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3
      .scaleOrdinal<string>()
      .domain(d.labels)
      .range(d.colors as string[]);
    const pie = d3
      .pie<number>()
      .sort(null)
      .value((v) => v);
    const arc = d3
      .arc<d3.PieArcDatum<number>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.95);

    g.selectAll('path')
      .data(pie(d.values))
      .join('path')
      .attr('d', arc as any)
      .attr('fill', (_p, i) => color(d.labels[i]) as string)
      .append('title')
      .text((_p, i) => `${d.labels[i]}: ${d.values[i]}`);

    const legend = svg
      .append('g')
      .attr(
        'transform',
        `translate(${Math.min(width - 160, width * 0.65)},16)`,
      );
    legend
      .selectAll('g')
      .data(d.labels.map((label, i) => ({ label, value: d.values[i] })))
      .join('g')
      .attr('transform', (_dd, i) => `translate(0, ${i * 18})`)
      .each(function (row) {
        const r = d3.select(this);
        r.append('rect')
          .attr('width', 12)
          .attr('height', 12)
          .attr('rx', 2)
          .attr('fill', color(row.label) as string);
        r.append('text')
          .attr('x', 18)
          .attr('y', 10)
          .text(`${row.label} (${row.value})`);
      });
  }
}
